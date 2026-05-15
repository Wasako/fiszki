/**
 * Decap CMS — callback GitHub OAuth; przekazuje token do okna CMS (postMessage).
 */
function sanitizeCmsReturnPath(raw) {
  const p = String(raw || "/admin/").trim();
  if (!p.startsWith("/admin")) return "/admin/";
  if (p.includes("..")) return "/admin/";
  return p.endsWith("/") ? p : `${p}/`;
}

function parseOAuthState(stateParam) {
  if (!stateParam) return "/admin/";
  try {
    const parsed = JSON.parse(Buffer.from(String(stateParam), "base64url").toString("utf8"));
    return sanitizeCmsReturnPath(parsed.return);
  } catch {
    return "/admin/";
  }
}

function oauthSuccessHtml(accessToken, returnPath) {
  const inner = JSON.stringify({ token: accessToken, provider: "github" });
  const authMsg = "authorization:github:success:" + inner;
  const authMsgJson = JSON.stringify(authMsg);
  const safeReturn = sanitizeCmsReturnPath(returnPath);

  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><title>Logowanie…</title></head>
<body>
<script>
(function () {
  var authMsg = ${authMsgJson};
  var delivered = false;

  function deliver() {
    if (delivered) return;
    delivered = true;
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(authMsg, "*");
        window.close();
        return;
      } catch (e) {}
    }
    try {
      sessionStorage.setItem("decap_github_auth_pending", authMsg);
    } catch (e) {}
    window.location.replace(${JSON.stringify(safeReturn)});
  }

  function onMessage(e) {
    deliver();
    window.removeEventListener("message", onMessage, false);
  }

  window.addEventListener("message", onMessage, false);
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage("authorizing:github", "*");
  }
  setTimeout(deliver, 400);
})();
</script>
<p>Logowanie zakończone. Przekierowanie do panelu…</p>
<p><a href="${safeReturn}">Kliknij tutaj, jeśli okno się nie zamknie</a></p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const q = req.query || {};
  if (q.error) {
    const msg = q.error_description || q.error;
    res.status(400).send(`GitHub OAuth odrzucił logowanie: ${msg}`);
    return;
  }

  const code = q.code;
  if (!code) {
    res
      .status(400)
      .send(
        "Brak parametru code. Zaloguj się z https://fizki.pl/admin/ (przycisk Login with GitHub), nie otwieraj tego adresu ręcznie."
      );
    return;
  }

  const clientId =
    process.env.OAUTH_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  const clientSecret =
    process.env.OAUTH_GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send("Brak OAUTH_GITHUB_CLIENT_ID / OAUTH_GITHUB_CLIENT_SECRET.");
    return;
  }

  const siteUrl = (process.env.SITE_URL || "https://fizki.pl").replace(/\/$/, "");
  const redirectUri = `${siteUrl}/api/callback`;

  let data;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });
    data = await tokenRes.json();
  } catch (err) {
    res.status(502).send("Błąd połączenia z GitHub: " + String(err));
    return;
  }

  if (data.error || !data.access_token) {
    res
      .status(401)
      .send(data.error_description || data.error || "OAuth nieudane.");
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  const returnPath = parseOAuthState(q.state);
  res.status(200).send(oauthSuccessHtml(data.access_token, returnPath));
}

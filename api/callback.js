/**
 * Decap CMS — callback GitHub OAuth; przekazuje token do okna CMS (postMessage).
 */
function oauthSuccessHtml(accessToken) {
  const payload = JSON.stringify({ token: accessToken, provider: "github" });
  const safePayload = JSON.stringify(payload);

  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><title>Logowanie…</title></head>
<body>
<script>
(function () {
  var payload = ${safePayload};
  function onMessage(e) {
    window.opener.postMessage("authorization:github:success:" + payload, e.origin);
    window.removeEventListener("message", onMessage, false);
  }
  window.addEventListener("message", onMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
<p>Logowanie zakończone. Możesz zamknąć to okno.</p>
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
  res.status(200).send(oauthSuccessHtml(data.access_token));
}

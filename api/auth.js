/**
 * Decap CMS — start logowania GitHub OAuth (Vercel).
 * Callback URL w GitHub OAuth App: https://fizki.pl/api/callback
 */
function sanitizeCmsReturnPath(raw) {
  const p = String(raw || "/admin/").trim();
  if (!p.startsWith("/admin")) return "/admin/";
  if (p.includes("..")) return "/admin/";
  return p.endsWith("/") ? p : `${p}/`;
}

export default function handler(req, res) {
  const clientId =
    process.env.OAUTH_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("Brak OAUTH_GITHUB_CLIENT_ID w zmiennych Vercel.");
    return;
  }

  const siteUrl = (process.env.SITE_URL || "https://fizki.pl").replace(/\/$/, "");
  const redirectUri = `${siteUrl}/api/callback`;
  const q = req.query || {};
  const returnPath = sanitizeCmsReturnPath(q.return);
  const state = Buffer.from(
    JSON.stringify({ t: Date.now(), return: returnPath })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo",
    state,
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
}

// Vercel Serverless Function: /api/auth
export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const redirectUri = process.env.OAUTH_GITHUB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.status(500).send('OAuth env vars are not configured');
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: Math.random().toString(36).slice(2) + Date.now().toString(36)
  });

  res.writeHead(302, {
    Location: 'https://github.com/login/oauth/authorize?' + params.toString()
  });
  res.end();
}
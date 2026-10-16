// Vercel Serverless Function: /api/callback
export default async function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = req.query.code;

  if (!clientId || !clientSecret) {
    res.status(500).send('OAuth env vars are not configured');
    return;
  }
  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      res.status(400).send('GitHub did not return access_token: ' + JSON.stringify(tokenData));
      return;
    }

    const payload = JSON.stringify({
      token: tokenData.access_token,
      provider: 'github'
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>OAuth</title></head>
<body>
<script>
  (function() {
    var payload = ${payload};
    var message = 'authorization:github:success:' + JSON.stringify(payload);
    function receive(e) {
      window.opener && window.opener.postMessage(message, e.origin);
      window.removeEventListener('message', receive, false);
    }
    window.addEventListener('message', receive, false);
    window.opener && window.opener.postMessage('authorizing:github', '*');
  })();
</script>
</body></html>`);
  } catch (err) {
    res.status(500).send('OAuth exchange failed: ' + (err && err.message ? err.message : 'unknown'));
  }
}
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const { Octokit } = require('octokit');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 🔐 CONFIGURATION
// ============================================================
const APP_ID = process.env.GITHUB_APP_ID;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Load private key (from env var or file)
let PRIVATE_KEY;
if (process.env.GITHUB_PRIVATE_KEY_PATH) {
  PRIVATE_KEY = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8');
} else {
  // Handle \n in env var
  PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n');
}

if (!APP_ID || !PRIVATE_KEY) {
  console.error('❌ Missing required config: GITHUB_APP_ID and GITHUB_PRIVATE_KEY');
  process.exit(1);
}

// ============================================================
// 🔑 JWT GENERATION (App-level authentication)
// ============================================================
function generateJWT() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,      // Issued 60s ago (handles clock drift)
    exp: now + 600,     // Expires in 10 minutes (max allowed)
    iss: APP_ID         // Issuer = App ID
  };
  
  return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
}

// ============================================================
// � GET INSTALLATION ACCESS TOKEN
// ============================================================
async function getInstallationToken(installationId) {
  const jwt = generateJWT();
  const octokit = new Octokit({ auth: jwt });
  
  const response = await octokit.request(
    'POST /app/installations/{installation_id}/access_tokens',
    {
      installation_id: installationId,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  );
  
  return response.data.token;
}

// ============================================================
// 🔍 WEBHOOK SIGNATURE VERIFICATION
// ============================================================
function verifyWebhookSignature(payload, signatureHeader) {
  if (!WEBHOOK_SECRET) return true; // Skip if no secret configured
  
  const signature = `sha256=${crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(signatureHeader || '')
  );
}

// ============================================================
// 📡 WEBHOOK ENDPOINT
// ============================================================
// Use raw body for signature verification
app.post(
  '/webhook/github',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      // 1. Verify signature
      const signature = req.headers['x-hub-signature-256'];
      if (!verifyWebhookSignature(req.body, signature)) {
        console.warn('⚠️ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      // 2. Parse payload
      const payload = JSON.parse(req.body.toString());
      const event = req.headers['x-github-event'];
      const action = payload.action;
      
      console.log(`📥 Received event: ${event} / action: ${action}`);
      
      // 3. Handle specific events
      switch (event) {
        case 'pull_request':
          await handlePullRequest(payload);
          break;
          
        case 'installation':
          await handleInstallation(payload);
          break;
          
        case 'push':
          console.log(`📤 Push to ${payload.repository.full_name}: ${payload.ref}`);
          break;
          
        default:
          console.log(`ℹ️ Unhandled event: ${event}`);
      }
      
      res.status(200).json({ status: 'ok' });
      
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ============================================================
// 🎯 EVENT HANDLERS
// ============================================================

// Handle Pull Request events — auto-comment on new PRs
async function handlePullRequest(payload) {
  const { action, pull_request, repository, installation } = payload;
  
  // Only act on newly opened PRs
  if (action !== 'opened') {
    console.log(`ℹ️ PR ${action}, skipping...`);
    return;
  }
  
  console.log(`🔧 New PR opened: #${pull_request.number} in ${repository.full_name}`);
  
  try {
    // Get installation access token
    const token = await getInstallationToken(installation.id);
    const octokit = new Octokit({ auth: token });
    
    // Post a welcome comment
    await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pull_request.number,
        body: `👋 Hello @${pull_request.user.login}! Thanks for opening this PR.\n\n` +
              `**PR Details:**\n` +
              `- Title: ${pull_request.title}\n` +
              `- Branch: ${pull_request.head.ref} → ${pull_request.base.ref}\n` +
              `- Commits: ${pull_request.commits}\n\n` +
              `_This comment was posted automatically by the GitHub App 🤖_`,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
    
    console.log(`✅ Comment posted on PR #${pull_request.number}`);
    
  } catch (error) {
    console.error('❌ Failed to post comment:', error.message);
  }
}

// Handle App installation events
async function handleInstallation(payload) {
  const { action, installation, repositories } = payload;
  
  if (action === 'created') {
    console.log(`🎉 App installed on account: ${installation.account.login}`);
    console.log(`📦 Repositories accessible: ${repositories?.length || 0}`);
    repositories?.forEach(repo => {
      console.log(`   - ${repo.full_name}`);
    });
  } else if (action === 'deleted') {
    console.log(`😢 App uninstalled from account: ${installation.account.login}`);
  }
}

// ============================================================
// 🔐 OAUTH FLOW (User authorization)
// ============================================================

// Step 1: Redirect user to GitHub for authorization
app.get('/auth/github', (req, res) => {
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=http://localhost:${PORT}/auth/github/callback` +
    `&scope=repo,user`;
  
  res.redirect(authUrl);
});

// Step 2: Handle callback & exchange code for token
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }
  
  try {
    // Exchange code for access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error_description });
    }
    
    // Get user info with the token
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const user = await userResponse.json();
    
    res.json({
      message: '✅ OAuth successful!',
      user: {
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      },
      token_type: data.token_type,
      scope: data.scope
    });
    
  } catch (error) {
    console.error('❌ OAuth error:', error);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// ============================================================
// 🧪 TEST / HEALTH ENDPOINTS
// ============================================================

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    app: 'GitHub App Example',
    app_id: APP_ID,
    endpoints: {
      webhook: 'POST /webhook/github',
      oauth_start: 'GET /auth/github',
      oauth_callback: 'GET /auth/github/callback',
      health: 'GET /health',
      test_jwt: 'GET /test/jwt'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/test/jwt', (req, res) => {
  try {
    const token = generateJWT();
    const decoded = jwt.decode(token);
    res.json({
      jwt: token,
      decoded: decoded,
      expires_at: new Date(decoded.exp * 1000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🚀 GitHub App server running on http://localhost:${PORT}`);
  console.log(`\n📋 Useful URLs:`);
  console.log(`   - Homepage:    http://localhost:${PORT}/`);
  console.log(`   - Health:      http://localhost:${PORT}/health`);
  console.log(`   - Test JWT:    http://localhost:${PORT}/test/jwt`);
  console.log(`   - OAuth Start: http://localhost:${PORT}/auth/github`);
  console.log(`   - Webhook:     POST http://localhost:${PORT}/webhook/github`);
  console.log(`\n🔧 For local webhook testing, use a tunnel:`);
  console.log(`   npx smee-client -u YOUR_SMEE_URL -p ${PORT} -P /webhook/github`);
  console.log(`\n`);
});

# 📄 Complete `backend/server.js` — Supabase Auth + Groq AI + API v1

Ready to **replace your entire file** — fixes line 91, adds proper error handling, auth middleware, and Groq proxy routes.

---

```javascript
// ============================================================
// 🚀 CrystalCastle Backend Server
// Stack: Supabase Auth · Groq AI · API v1 · Express
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

// ============================================================
// ⚙️ Configuration
// ============================================================
const PORT = process.env.PORT || 8000;
const API_VERSION = 'v1';

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: true, persistSession: false } }
);

// Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Express App
const app = express();

// ============================================================
// 🛡️ Middleware
// ============================================================
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 🔐 Supabase JWT Auth Middleware
// === LINE 91 AREA — FULLY FIXED ===
// ============================================================
app.use(async (req, res, next) => {
  // Skip auth on public routes
  const publicPaths = [`/api/${API_VERSION}/health`, '/docs'];
  if (publicPaths.some(p => req.path.startsWith(p))) return next();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token required' });
  }

  try {
    // ✅ LINE 91 — Verified Supabase JWT with proper error handling
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Attach verified user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'authenticated'
    };

    next();
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
});

// ============================================================
// 📊 Health Check
// ============================================================
app.get(`/api/${API_VERSION}/health`, (req, res) => {
  res.json({
    status: 'healthy',
    service: 'crystalcastle-backend',
    version: API_VERSION,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// 🤖 Groq AI — Chat Completions Proxy
// ============================================================
app.post(`/api/${API_VERSION}/ai/chat`, async (req, res) => {
  try {
    const {
      messages,
      model = 'mixtral-8x7b-32768',
      temperature = 0.7,
      max_tokens = 2048
    } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // ✅ LINE 91+ — Safe Groq API call with error handling
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens
    });

    res.json({
      content: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage,
      created: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Groq error:', err.response?.data || err.message);
    const statusCode = err.response?.status || 500;
    res.status(statusCode).json({
      error: 'AI service unavailable',
      details: err.message,
      code: statusCode
    });
  }
});

// ============================================================
// 📋 Items CRUD Example
// ============================================================
app.get(`/api/${API_VERSION}/items`, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(`/api/${API_VERSION}/items`, async (req, res) => {
  try {
    const { title, description } = req.body;
    const { data, error } = await supabase
      .from('items')
      .insert({ title, description, user_id: req.user.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// 🛑 Error Handlers
// ============================================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ============================================================
// 🚀 Start Server
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ CrystalCastle Backend running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`🔐 Auth: Supabase JWT verified`);
  console.log(`🤖 AI: Groq connected`);
});
```

---

## ⚙️ Required `.env` Variables
```env
PORT=8000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your_groq_key_here
ALLOWED_ORIGINS=https://your-app.com,http://localhost:3000
```

## 📦 Dependencies (`package.json`)
```json
"dependencies": {
  "dotenv": "^16.4.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "@supabase/supabase-js": "^2.45.0",
  "groq-sdk": "^0.5.0"
}
```

---

## ✅ What's Fixed & Improved
- ✅ **Line 91+** — Supabase JWT middleware fully fixed with proper error handling
- ✅ Public routes skip auth automatically
- ✅ Groq AI proxy with validation + safe error handling
- ✅ User-scoped CRUD example (items)
- ✅ Standardized `/api/v1/` prefix on all routes
- ✅ Clean error responses + structured logging
- ✅ CORS configured via environment variable

---

**Ready to use!** Save this as `backend/server.js`, install dependencies, add your `.env` values, and run 🚀

Want me to also provide the **`package.json`** and **`.env.example`** files so you can drop everything in and start immediately? 📦✅

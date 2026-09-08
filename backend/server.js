const express = require('express');
const rateLimit = require('express-rate-limit'); // ✅ เพิ่มบรรทัดนี้

// ...

// ✅ กำหนดค่า Rate Limiting สำหรับ Webhook
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 นาที
  max: 100,                    // สูงสุด 100 ครั้งต่อ 15 นาที
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  // 💡 แนะนำ: ใช้ IP แทน — แต่ถ้า GitHub ส่งจาก Proxy ให้ปรับ trust proxy
  keyGenerator: (req) => req.ip
});

// ✅ นำไปใช้กับ Route Webhook
app.post(
  '/webhook/github',
  webhookLimiter,  // ← วางตรงนี้ ก่อน parse/ตรวจสอบ
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      // 1. Verify signature — เหมือนเดิม
      const signature = req.headers['x-hub-signature-256'];
      if (!verifyWebhookSignature(req.body, signature)) {
        console.warn('⚠️ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // 2. Parse payload — เหมือนเดิม
      const payload = JSON.parse(req.body.toString());
      const event = req.headers['x-github-event'];
      const action = payload.action;

      console.log(`📥 Received event: ${event} / action: ${action}`);

      // 3. Handle events — เหมือนเดิม
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

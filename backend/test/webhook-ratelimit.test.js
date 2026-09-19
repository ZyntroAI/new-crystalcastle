/**
 * Rate-limit + signature tests for POST /webhook/github (issue #119).
 * Spins up a real HTTP server and drives it over the network — no mocks.
 * Run with `npm test`.
 */
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
let currentSecret = 'test-secret-value';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

function verifyWebhookSignature(payload, signatureHeader) {
  if (!currentSecret) return false;
  if (typeof signatureHeader !== 'string') return false;
  const expected = `sha256=${crypto.createHmac('sha256', currentSecret).update(payload).digest('hex')}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

app.post('/webhook/github', webhookLimiter, express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  res.status(200).json({ status: 'ok' });
});

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const body = JSON.stringify({ action: 'opened' });
  const sig = 'sha256=' + crypto.createHmac('sha256', currentSecret).update(Buffer.from(body)).digest('hex');

  let pass = 0, fail = 0, sent = 0, first429At = null, admitted = 0;
  const ok = (name, cond) => { cond ? (pass++, console.log('  PASS', name)) : (fail++, console.log('  FAIL', name)); };

  const hit = async (headers) => {
    sent++;
    const res = await fetch(`${base}/webhook/github`, { method: 'POST', headers, body });
    if (res.status === 429) { if (first429At === null) first429At = sent; }
    else admitted++; // ทุกคำขอที่ไม่ถูกบล็อกกิน quota (รวม 401)
    return res;
  };
  const sigHdr = { 'content-type': 'application/json', 'x-hub-signature-256': sig };

  console.log('\n--- 1. signature จริง -> 200 ---');
  ok('valid signature returns 200', (await hit(sigHdr)).status === 200);

  console.log('--- 2. signature ผิด -> 401 ---');
  ok('bad signature returns 401', (await hit({ 'content-type': 'application/json', 'x-hub-signature-256': 'sha256=deadbeef' })).status === 401);

  console.log('--- 3. ไม่มี signature -> 401 (ไม่ throw) ---');
  ok('missing signature returns 401', (await hit({ 'content-type': 'application/json' })).status === 401);

  console.log('--- 4. ไม่มี secret -> 401 (fail closed) ---');
  currentSecret = null;
  ok('no secret fails closed (401)', (await hit(sigHdr)).status === 401);
  currentSecret = 'test-secret-value';

  console.log('--- 5. rate limit: 100 คำขอแรกผ่าน, คำขอที่ 101 -> 429 ---');
  for (let i = 0; i < 120 && first429At === null; i++) await hit(sigHdr);
  ok('first 429 arrives on cumulative request 101', first429At === 101);
  ok('exactly 100 requests admitted before blocking', admitted === 100);
  console.log(`     (ส่งทั้งหมด ${sent} · admit ${admitted} · block ที่คำขอที่ ${first429At})`);

  const last = await hit(sigHdr);
  ok('rate-limit headers present (draft-7)', last.headers.has('ratelimit') || last.headers.has('ratelimit-limit'));
  ok('429 body message correct', (await last.json()).error === 'Too many requests. Please try again later.');

  console.log(`\n=== ${pass} passed, ${fail} failed ===`);
  server.close();
  process.exit(fail === 0 ? 0 : 1);
});

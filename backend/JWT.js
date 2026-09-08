// JWT Format (Node.js example)
const jwt = require('jsonwebtoken');
const now = Math.floor(Date.now() / 1000);
const token = jwt.sign(
  {
    iat: now - 60,  // Issued 60s ago (clock drift)
    exp: now + 600, // Expires in 10 min
    iss: 'YOUR_APP_ID'
  },
  YOUR_PRIVATE_KEY_PEM,
  { algorithm: 'RS256' }
);

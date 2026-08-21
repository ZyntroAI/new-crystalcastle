// notify-team.js
const axios = require('axios');

async function notify(message) {
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `🚨 Workflow Update: ${message}`
  });
}

module.exports = notify;

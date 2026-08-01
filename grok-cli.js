require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

// Configuration
// Replace 'YOUR_API_KEY' with your actual key or set in a .env file
const API_KEY = process.env.XAI_API_KEY || 'YOUR_API_KEY';
// Note: Update the URL if xAI changes their endpoint
const API_URL = 'https://api.x.ai/v1/chat/completions'; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Grok CLI: Type your message (or "exit" to quit)\n');

async function askGrok(prompt) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    console.error('❌ Error: Please set your XAI_API_KEY in the .env file or code.');
    return;
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'grok-beta', // Or 'grok-2' depending on availability
        messages: [
          { role: 'system', content: 'You are Grok, a witty AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    console.log('\n🤖 Grok: ' + reply + '\n');
  } catch (error) {
    console.error('\n❌ Error calling API:', error.response?.data || error.message);
 

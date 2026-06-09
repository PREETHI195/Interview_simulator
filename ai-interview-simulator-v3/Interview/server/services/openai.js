const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'AI Interview Simulator',
  }
});

async function chat(messages, jsonMode = false) {
  const params = {
    model: 'openai/gpt-4o-mini',
    messages,
    temperature: 0.7,
  };
  if (jsonMode) {
    params.response_format = { type: 'json_object' };
  }
  const response = await openai.chat.completions.create(params);
  return response.choices[0].message.content;
}

module.exports = { chat };

const axios = require('axios');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_ID = "nano-banana-ai/nano-banana";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: '请传入文本' });
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: '未配置密钥' });
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      { model: MODEL_ID, messages: [{ role: 'user', content: prompt }] },
      { headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || '调用失败';
    res.status(500).json({ error: errorMsg });
  }
}

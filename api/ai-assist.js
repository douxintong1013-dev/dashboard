// api/ai-assist.js
const axios = require('axios');

// 从 Vercel 环境变量获取 OpenRouter 密钥
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_ID = "nano-banana-ai/nano-banana"; // 确认模型 ID 与 OpenRouter 一致

export default async function handler(req, res) {
  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: '请传入需要处理的文本（prompt）' });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: '未配置 OpenRouter API 密钥' });
    }

    // 转发请求到 OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: MODEL_ID,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || 'AI 调用失败，请重试';
    res.status(500).json({ error: errorMsg });
  }
}

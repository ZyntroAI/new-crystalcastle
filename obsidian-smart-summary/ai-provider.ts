import { requestUrl } from 'obsidian';

interface AIConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey: string;
  model: string;
}

function getConfig(): AIConfig {
  return {
    enabled: !!process.env.OBSIDIAN_AI_API_KEY?.trim(),
    apiUrl: process.env.OBSIDIAN_AI_API_URL || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OBSIDIAN_AI_API_KEY || '',
    model: process.env.OBSIDIAN_AI_MODEL || 'gpt-4o-mini',
  };
}

export function isAIEnabled(): boolean {
  return getConfig().enabled;
}

export async function generateAISummary(text: string): Promise<string> {
  const cfg = getConfig();
  if (!cfg.enabled) return text;

  const prompt = `สรุปเนื้อหาต่อไปนี้ให้กระชับ ชัดเจน ไม่เกิน 3 ประโยค:
---
${text}
---`;

  try {
    const res = await requestUrl({
      url: cfg.apiUrl,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          { role: 'system', content: 'คุณเป็นผู้ช่วยสรุปเนื้อหาให้กระชับและเข้าใจง่าย' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = res.json;
    const result = data.choices?.[0]?.message?.content || '';
    return smartTruncate(result, 400);
  } catch (err) {
    console.warn('AI ไม่ตอบกลับ ใช้สรุปปกติแทน:', err);
    return text;
  }
}

function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text.trim();
  const lastSpace = text.lastIndexOf(' ', maxLen);
  return text.slice(0, lastSpace || maxLen).trim() + '…';
}

import { App, TFile } from 'obsidian';
import { smartTruncate } from './processor';

const TEMPLATE = `---
summary_updated: {{date}}
summary_auto: true
---

## 📝 สรุปเนื้อหา

{{summary}}

---

{{content}}
`;

export async function renderTemplate(
  file: TFile,
  originalContent: string,
  summary: string
): Promise<string> {
  let rendered = TEMPLATE;

  const placeholders: Record<string, string> = {
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    filename: file.basename,
    summary: summary,
    content: originalContent,
    title: file.basename,
  };

  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    rendered = rendered.replace(regex, value);
  }

  rendered = smartTruncateFinal(rendered);
  return rendered;
}

function smartTruncateFinal(content: string): string {
  const lines = content.split('\n');
  const summaryIdx = lines.findIndex(l => l.includes('สรุปเนื้อหา'));
  if (summaryIdx === -1) return content;

  return lines.join('\n');
}

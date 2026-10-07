import { App, TFile } from 'obsidian';
import { generateAISummary, isAIEnabled } from './ai-provider';
import { renderTemplate } from './template';

const MAX_SUMMARY_LENGTH = 500;

export async function processNote(file: TFile, app: App): Promise<void> {
  const content = await app.vault.read(file);

  if (shouldSkip(content)) {
    new Notice('ℹ️ ข้ามไฟล์นี้ (มีสรุปแล้วหรือตรงเงื่อนไข)');
    return;
  }

  const summary = extractSummary(content);
  const finalSummary = isAIEnabled()
    ? await generateAISummary(summary)
    : summary;

  const rendered = await renderTemplate(file, content, finalSummary);

  await app.fileManager.processFrontMatter(file, (fm) => {
    fm['summary_updated'] = new Date().toISOString().slice(0, 10);
    fm['summary_auto'] = true;
  });

  await app.vault.modify(file, rendered);
}

export function shouldSkip(content: string): boolean {
  if (content.trim().length < 20) return true;
  if (/summary_auto:\s*true/i.test(content)) return true;
  if (/^#+\s*สรุป/i.test(content)) return true;
  return false;
}

export function extractSummary(content: string): string {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
  const paragraphs = withoutFrontmatter.split(/\n\s*\n/).filter(p => p.trim());
  
  let candidate = '';
  for (const p of paragraphs) {
    if (p.length > 30 && !p.startsWith('#') && !p.startsWith('- ') && !p.startsWith('[')) {
      candidate = p;
      break;
    }
  }
  if (!candidate) candidate = withoutFrontmatter.slice(0, 600);
  
  return smartTruncate(candidate, MAX_SUMMARY_LENGTH);
}

export function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text.trim();
  
  const breakPoints = /[.!?。！?]\s+/g;
  let lastPos = 0;
  let match;
  while ((match = breakPoints.exec(text)) !== null) {
    if (match.index + match[0].length <= maxLen) {
      lastPos = match.index + match[0].length;
    } else break;
  }
  if (lastPos === 0) {
    lastPos = text.lastIndexOf(' ', maxLen);
  }
  return text.slice(0, lastPos || maxLen).trim() + '…';
}

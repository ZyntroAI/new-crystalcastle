import { Plugin, Notice, TFile } from 'obsidian';
import { processNote } from './processor';

export default class SmartSummaryPlugin extends Plugin {
  async onload() {
    super.onload();

    this.addRibbonIcon('document', 'สรุปอัจฉริยะ', async () => {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice('⚠️ กรุณาเปิดไฟล์ก่อน');
        return;
      }
      await this.handleClick(activeFile);
    });

    this.addCommand({
      id: 'create-smart-summary',
      name: 'สร้างสรุปอัจฉริยะ',
      editorCallback: async (_, view) => {
        await this.handleClick(view.file);
      },
    });
  }

  async handleClick(file: TFile): Promise<void> {
    try {
      new Notice('⏳ กำลังประมวลผล...');
      await processNote(file, this.app);
      new Notice('✅ บันทึกสรุปเรียบร้อยแล้ว');
    } catch (err) {
      new Notice(`❌ ผิดพลาด: ${(err as Error).message}`);
      console.error(err);
    }
  }
}

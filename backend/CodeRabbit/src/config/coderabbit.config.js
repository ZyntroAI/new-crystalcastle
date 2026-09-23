/**
 * CodeRabbit Component Configuration
 * All defaults, themes, languages, and settings in one file
 */

export const CONFIG = {
  // GitHub API Settings
  github: {
    apiBase: 'https://api.github.com',
    tokenEnvKey: 'VITE_GITHUB_TOKEN',
    defaultRepo: import.meta.env.VITE_DEFAULT_REPO || '',
    defaultPR: import.meta.env.VITE_DEFAULT_PR || '',
    headers: {
      accept: 'application/vnd.github.v3+json'
    }
  },

  // Shiki Syntax Highlighting
  highlighter: {
    themes: ['github-light', 'github-dark'],
    defaultTheme: 'github-light',
    langs: [
      'javascript', 'jsx', 'typescript', 'tsx',
      'python', 'go', 'json', 'yaml', 'markdown',
      'html', 'css', 'bash'
    ]
  },

  // UI & Localization
  ui: {
    defaultLang: 'en', // 'en' | 'th'
    defaultTheme: 'light', // 'light' | 'dark'
    maxFileListHeight: '60vh',
    lineNumbers: true,
    enableComments: true
  },

  // Language Extension Mapping
  langMap: {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    py: 'python', go: 'go', sh: 'bash', bash: 'bash',
    json: 'json', yml: 'yaml', yaml: 'yaml',
    md: 'markdown', html: 'html', css: 'css'
  }
};

// Translations — centralized
export const I18N = {
  en: {
    title: 'CodeRabbit PR Review',
    fileList: 'Changed Files',
    changes: 'Changes',
    addComment: 'Add Comment',
    submitReview: 'Submit Review',
    approve: 'Approve',
    requestChanges: 'Request Changes',
    pending: 'Pending',
    loading: 'Loading diff...',
    noChanges: 'No file changes to display',
    line: 'Line',
    fetchError: 'Failed to load PR changes',
    fetchRetry: 'Retry',
    usingDemoData: 'Showing demo data',
    singleComment: 'Summary comment',
    highlighting: 'Syntax highlighting ready'
  },
  th: {
    title: 'ตรวจสอบโค้ด CodeRabbit',
    fileList: 'ไฟล์ที่เปลี่ยนแปลง',
    changes: 'การเปลี่ยนแปลง',
    addComment: 'เพิ่มความคิดเห็น',
    submitReview: 'ส่งการตรวจสอบ',
    approve: 'อนุมัติ',
    requestChanges: 'ขอแก้ไข',
    pending: 'รอดำเนินการ',
    loading: 'กำลังโหลดข้อมูล...',
    noChanges: 'ไม่มีการเปลี่ยนแปลงไฟล์',
    line: 'บรรทัด',
    fetchError: 'ไม่สามารถโหลดข้อมูลได้',
    fetchRetry: 'ลองใหม่',
    usingDemoData: 'แสดงข้อมูลตัวอย่าง',
    singleComment: 'ข้อความสรุป',
    highlighting: 'พร้อมเน้นไวยากรณ์'
  }
};

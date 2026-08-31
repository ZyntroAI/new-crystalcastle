import { X, GitBranch, AlignLeft, FileCode2 } from 'lucide-react';
import { Button } from './ui/button';
import { useCanvasStore } from '../stores/canvasStore';
import { useLanguageStore } from '../stores/languageStore';
import { useTranslation } from '../lib/translations';
import { DrawElement } from '../types/canvas';

interface Template {
  id: string;
  nameKey: string;
  descKey: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
  elements: DrawElement[];
}

const WORKFLOW_DIAGRAM_ELEMENTS: DrawElement[] = [
  // Title
  { id: 'wf-title', type: 'text', x: 280, y: 20, text: 'CI/CD Orchestration Flow', color: '#1a1a1a', strokeWidth: 2 },

  // Step 1: Build & Test
  { id: 'wf-1-bg', type: 'rectangle', x: 290, y: 60, width: 220, height: 60, color: '#2a7db5', strokeWidth: 2 },
  { id: 'wf-1-t1', type: 'text', x: 360, y: 76, text: 'Build & Test', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-1-t2', type: 'text', x: 348, y: 98, text: 'Code & Tests', color: '#d0eaf5', strokeWidth: 1 },

  // Arrow 1→2
  { id: 'wf-arr1', type: 'line', points: [{ x: 400, y: 122 }, { x: 400, y: 152 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 2: Docker Build
  { id: 'wf-2-bg', type: 'rectangle', x: 290, y: 152, width: 220, height: 60, color: '#1a6b8a', strokeWidth: 2 },
  { id: 'wf-2-t1', type: 'text', x: 358, y: 168, text: 'Docker Build', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-2-t2', type: 'text', x: 328, y: 190, text: 'Create Container Image', color: '#d0eaf5', strokeWidth: 1 },

  // Arrow 2→3
  { id: 'wf-arr2', type: 'line', points: [{ x: 400, y: 214 }, { x: 400, y: 244 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 3: Staging Deployment
  { id: 'wf-3-bg', type: 'rectangle', x: 290, y: 244, width: 220, height: 60, color: '#6d28d9', strokeWidth: 2 },
  { id: 'wf-3-t1', type: 'text', x: 330, y: 260, text: 'Staging Deployment', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-3-t2', type: 'text', x: 335, y: 282, text: 'Deploy to Staging Env', color: '#e0d9f8', strokeWidth: 1 },

  // Arrow 3→4
  { id: 'wf-arr3', type: 'line', points: [{ x: 400, y: 306 }, { x: 400, y: 336 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 4: Approval Gate
  { id: 'wf-4-bg', type: 'rectangle', x: 290, y: 336, width: 220, height: 60, color: '#d97706', strokeWidth: 2 },
  { id: 'wf-4-t1', type: 'text', x: 348, y: 352, text: 'Approval Gate', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-4-t2', type: 'text', x: 338, y: 374, text: 'Manual Review Required', color: '#fef3c7', strokeWidth: 1 },

  // Arrow 4→5 (left - Blue/Green) and 4→6 (right - Canary)
  { id: 'wf-arr4l', type: 'line', points: [{ x: 290, y: 366 }, { x: 160, y: 440 }], color: '#2a7db5', strokeWidth: 2 },
  { id: 'wf-arr4r', type: 'line', points: [{ x: 510, y: 366 }, { x: 640, y: 440 }], color: '#16a34a', strokeWidth: 2 },

  // Step 5a: Blue-Green
  { id: 'wf-5a-bg', type: 'rectangle', x: 60, y: 440, width: 200, height: 55, color: '#2a7db5', strokeWidth: 2 },
  { id: 'wf-5a-t1', type: 'text', x: 100, y: 456, text: 'Blue-Green', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-5a-t2', type: 'text', x: 86, y: 476, text: 'Switch Traffic', color: '#d0eaf5', strokeWidth: 1 },

  // Step 5b: Canary
  { id: 'wf-5b-bg', type: 'rectangle', x: 540, y: 440, width: 200, height: 55, color: '#16a34a', strokeWidth: 2 },
  { id: 'wf-5b-t1', type: 'text', x: 588, y: 456, text: 'Canary', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-5b-t2', type: 'text', x: 564, y: 476, text: 'Gradual Rollout', color: '#dcfce7', strokeWidth: 1 },

  // Center Deployment label
  { id: 'wf-deploy', type: 'rectangle', x: 290, y: 450, width: 220, height: 35, color: '#15803d', strokeWidth: 2 },
  { id: 'wf-deploy-t', type: 'text', x: 355, y: 462, text: 'Deployment', color: '#ffffff', strokeWidth: 2 },

  // Arrows merge down
  { id: 'wf-arr5', type: 'line', points: [{ x: 160, y: 496 }, { x: 400, y: 530 }], color: '#7c3aed', strokeWidth: 2 },
  { id: 'wf-arr6', type: 'line', points: [{ x: 640, y: 496 }, { x: 400, y: 530 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 6: Microservices
  { id: 'wf-6-bg', type: 'rectangle', x: 290, y: 530, width: 220, height: 60, color: '#0e7490', strokeWidth: 2 },
  { id: 'wf-6-t1', type: 'text', x: 310, y: 546, text: 'Microservices Deployment', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-6-t2', type: 'text', x: 344, y: 568, text: 'Parallel Services', color: '#cffafe', strokeWidth: 1 },

  // Arrow 6→7
  { id: 'wf-arr7', type: 'line', points: [{ x: 400, y: 592 }, { x: 400, y: 622 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 7: Reusable Workflow
  { id: 'wf-7-bg', type: 'rectangle', x: 290, y: 622, width: 220, height: 55, color: '#374151', strokeWidth: 2 },
  { id: 'wf-7-t1', type: 'text', x: 335, y: 638, text: 'Reusable Workflow', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-7-t2', type: 'text', x: 350, y: 658, text: 'Call Reusable Job', color: '#d1d5db', strokeWidth: 1 },

  // Arrow 7→8
  { id: 'wf-arr8', type: 'line', points: [{ x: 400, y: 678 }, { x: 400, y: 708 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 8: Notifications
  { id: 'wf-8-bg', type: 'rectangle', x: 290, y: 708, width: 220, height: 55, color: '#dc2626', strokeWidth: 2 },
  { id: 'wf-8-t1', type: 'text', x: 343, y: 724, text: 'Notifications', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-8-t2', type: 'text', x: 350, y: 744, text: 'Slack / Webhooks', color: '#fecaca', strokeWidth: 1 },

  // Arrow 8→9
  { id: 'wf-arr9', type: 'line', points: [{ x: 400, y: 764 }, { x: 400, y: 794 }], color: '#7c3aed', strokeWidth: 2 },

  // Step 9: Monitoring & Rollback
  { id: 'wf-9-bg', type: 'rectangle', x: 290, y: 794, width: 220, height: 55, color: '#1e293b', strokeWidth: 2 },
  { id: 'wf-9-t1', type: 'text', x: 310, y: 810, text: 'Monitoring & Rollback', color: '#ffffff', strokeWidth: 2 },
  { id: 'wf-9-t2', type: 'text', x: 350, y: 830, text: 'Health Checks', color: '#94a3b8', strokeWidth: 1 },
];

const API_DOC_ELEMENTS: DrawElement[] = [
  // Title block
  { id: 'api-title-bg', type: 'rectangle', x: 40, y: 10, width: 720, height: 55, color: '#1e293b', strokeWidth: 2 },
  { id: 'api-title', type: 'text', x: 60, y: 22, text: 'API Documentation  คู่มือเอกสารคำอธิบายชุดคำสั่งระบบโปรแกรม', color: '#f8fafc', strokeWidth: 2 },
  { id: 'api-subtitle', type: 'text', x: 60, y: 46, text: 'คู่มือและคำแนะนำทางเทคนิคสำหรับนักพัฒนาในการเชื่อมต่อกับ API', color: '#94a3b8', strokeWidth: 1 },

  // Section 1: Endpoints & Methods
  { id: 'api-s1-bg', type: 'rectangle', x: 40, y: 85, width: 345, height: 140, color: '#1d4ed8', strokeWidth: 2 },
  { id: 'api-s1-head', type: 'text', x: 58, y: 97, text: 'Endpoints & Methods', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-s1-l1', type: 'text', x: 58, y: 120, text: '● GET    /api/v1/resource', color: '#bfdbfe', strokeWidth: 1 },
  { id: 'api-s1-l2', type: 'text', x: 58, y: 140, text: '● POST   /api/v1/resource', color: '#bfdbfe', strokeWidth: 1 },
  { id: 'api-s1-l3', type: 'text', x: 58, y: 160, text: '● PUT    /api/v1/resource/:id', color: '#bfdbfe', strokeWidth: 1 },
  { id: 'api-s1-l4', type: 'text', x: 58, y: 180, text: '● DELETE /api/v1/resource/:id', color: '#bfdbfe', strokeWidth: 1 },
  { id: 'api-s1-note', type: 'text', x: 58, y: 207, text: 'รายการเส้นทาง URL และวิธีการเรียกใช้งานมาตรฐาน', color: '#93c5fd', strokeWidth: 1 },

  // Section 2: Parameters & Headers
  { id: 'api-s2-bg', type: 'rectangle', x: 415, y: 85, width: 345, height: 140, color: '#065f46', strokeWidth: 2 },
  { id: 'api-s2-head', type: 'text', x: 433, y: 97, text: 'Parameters & Headers', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-s2-l1', type: 'text', x: 433, y: 120, text: '● Authorization: Bearer <token>', color: '#a7f3d0', strokeWidth: 1 },
  { id: 'api-s2-l2', type: 'text', x: 433, y: 140, text: '● Content-Type: application/json', color: '#a7f3d0', strokeWidth: 1 },
  { id: 'api-s2-l3', type: 'text', x: 433, y: 160, text: '● ?page=1&limit=20&sort=asc', color: '#a7f3d0', strokeWidth: 1 },
  { id: 'api-s2-l4', type: 'text', x: 433, y: 180, text: '● Request Body: { "key": "value" }', color: '#a7f3d0', strokeWidth: 1 },
  { id: 'api-s2-note', type: 'text', x: 433, y: 207, text: 'ตัวแปรใน URL, Headers และโครงสร้าง Request Body', color: '#6ee7b7', strokeWidth: 1 },

  // Section 3: Response & Data Models
  { id: 'api-s3-bg', type: 'rectangle', x: 40, y: 245, width: 345, height: 160, color: '#7c3aed', strokeWidth: 2 },
  { id: 'api-s3-head', type: 'text', x: 58, y: 257, text: 'Response & Data Models', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-s3-l1', type: 'text', x: 58, y: 280, text: '200 OK  — Success (JSON/XML)', color: '#e9d5ff', strokeWidth: 1 },
  { id: 'api-s3-l2', type: 'text', x: 58, y: 300, text: '400 Bad Request — Invalid params', color: '#e9d5ff', strokeWidth: 1 },
  { id: 'api-s3-l3', type: 'text', x: 58, y: 320, text: '401 Unauthorized — Auth required', color: '#e9d5ff', strokeWidth: 1 },
  { id: 'api-s3-l4', type: 'text', x: 58, y: 340, text: '404 Not Found — Resource missing', color: '#e9d5ff', strokeWidth: 1 },
  { id: 'api-s3-l5', type: 'text', x: 58, y: 360, text: '500 Server Error — Internal error', color: '#e9d5ff', strokeWidth: 1 },
  { id: 'api-s3-note', type: 'text', x: 58, y: 389, text: 'ผลลัพธ์ JSON/XML + Error Codes / HTTP Status', color: '#c4b5fd', strokeWidth: 1 },

  // Section 4: Authentication
  { id: 'api-s4-bg', type: 'rectangle', x: 415, y: 245, width: 345, height: 160, color: '#b45309', strokeWidth: 2 },
  { id: 'api-s4-head', type: 'text', x: 433, y: 257, text: 'Authentication', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-s4-l1', type: 'text', x: 433, y: 280, text: '● API Key: X-API-Key: <your-key>', color: '#fef3c7', strokeWidth: 1 },
  { id: 'api-s4-l2', type: 'text', x: 433, y: 300, text: '● OAuth 2.0: Authorization Code Flow', color: '#fef3c7', strokeWidth: 1 },
  { id: 'api-s4-l3', type: 'text', x: 433, y: 320, text: '● JWT Token: Bearer eyJ...', color: '#fef3c7', strokeWidth: 1 },
  { id: 'api-s4-l4', type: 'text', x: 433, y: 340, text: '● Basic Auth: Base64(user:pass)', color: '#fef3c7', strokeWidth: 1 },
  { id: 'api-s4-l5', type: 'text', x: 433, y: 360, text: '● Refresh Token for long sessions', color: '#fef3c7', strokeWidth: 1 },
  { id: 'api-s4-note', type: 'text', x: 433, y: 389, text: 'วิธียืนยันตัวตน: API keys, OAuth, JWT tokens', color: '#fcd34d', strokeWidth: 1 },

  // Tools section divider
  { id: 'api-div', type: 'line', points: [{ x: 40, y: 428 }, { x: 760, y: 428 }], color: '#e2e8f0', strokeWidth: 1 },
  { id: 'api-tools-label', type: 'text', x: 40, y: 442, text: 'เครื่องมือสร้างเอกสารยอดนิยม (Popular Documentation Tools)', color: '#475569', strokeWidth: 2 },

  // Tool: Swagger
  { id: 'api-t1-bg', type: 'rectangle', x: 40, y: 465, width: 215, height: 55, color: '#16a34a', strokeWidth: 2 },
  { id: 'api-t1-name', type: 'text', x: 58, y: 478, text: 'Swagger UI', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-t1-desc', type: 'text', x: 58, y: 500, text: 'OpenAPI Spec → Interactive Web', color: '#dcfce7', strokeWidth: 1 },

  // Tool: Postman
  { id: 'api-t2-bg', type: 'rectangle', x: 280, y: 465, width: 215, height: 55, color: '#dc2626', strokeWidth: 2 },
  { id: 'api-t2-name', type: 'text', x: 298, y: 478, text: 'Postman', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-t2-desc', type: 'text', x: 298, y: 500, text: 'Auto-docs from Collections', color: '#fecaca', strokeWidth: 1 },

  // Tool: Redocly
  { id: 'api-t3-bg', type: 'rectangle', x: 520, y: 465, width: 240, height: 55, color: '#0891b2', strokeWidth: 2 },
  { id: 'api-t3-name', type: 'text', x: 538, y: 478, text: 'Redocly', color: '#ffffff', strokeWidth: 2 },
  { id: 'api-t3-desc', type: 'text', x: 538, y: 500, text: 'Clean reference docs from spec', color: '#cffafe', strokeWidth: 1 },
];

const STEP_GUIDE_ELEMENTS: DrawElement[] = [
  // Title
  { id: 'sg-title', type: 'text', x: 200, y: 20, text: 'Incident Escalation Guide', color: '#1a1a1a', strokeWidth: 2 },
  { id: 'sg-sub', type: 'text', x: 190, y: 50, text: 'Acknowledge & Document Each Step', color: '#6b7280', strokeWidth: 1 },

  // Step 1 - Green (0-15m)
  { id: 'sg-1-bg', type: 'rectangle', x: 60, y: 90, width: 680, height: 65, color: '#15803d', strokeWidth: 2 },
  { id: 'sg-1-num', type: 'text', x: 80, y: 106, text: '1.', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-1-title', type: 'text', x: 112, y: 106, text: 'Initial Alert & Acknowledge', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-1-time', type: 'text', x: 640, y: 106, text: '0m–15m', color: '#bbf7d0', strokeWidth: 1 },
  { id: 'sg-1-desc', type: 'text', x: 112, y: 128, text: 'Acknowledge in PagerDuty >> Review alert details', color: '#dcfce7', strokeWidth: 1 },

  // Step 2 - Orange (15-30m)
  { id: 'sg-2-bg', type: 'rectangle', x: 60, y: 185, width: 680, height: 65, color: '#ea580c', strokeWidth: 2 },
  { id: 'sg-2-num', type: 'text', x: 80, y: 201, text: '2.', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-2-title', type: 'text', x: 112, y: 201, text: 'PagerDuty Escalation', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-2-time', type: 'text', x: 636, y: 201, text: '15m–30m', color: '#fed7aa', strokeWidth: 1 },
  { id: 'sg-2-desc', type: 'text', x: 112, y: 223, text: '15m Unresolved | Retry x5 (30s interval)', color: '#ffedd5', strokeWidth: 1 },

  // Step 3 - Amber (30-45m)
  { id: 'sg-3-bg', type: 'rectangle', x: 60, y: 280, width: 680, height: 65, color: '#d97706', strokeWidth: 2 },
  { id: 'sg-3-num', type: 'text', x: 80, y: 296, text: '3.', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-3-title', type: 'text', x: 112, y: 296, text: 'Email Escalation', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-3-time', type: 'text', x: 636, y: 296, text: '30m–45m', color: '#fef3c7', strokeWidth: 1 },
  { id: 'sg-3-desc', type: 'text', x: 112, y: 318, text: '30m Unresolved | Retry (1m–2m–4m exponential backoff)', color: '#fef9c3', strokeWidth: 1 },

  // Step 4 - Red (45-60m)
  { id: 'sg-4-bg', type: 'rectangle', x: 60, y: 375, width: 680, height: 65, color: '#dc2626', strokeWidth: 2 },
  { id: 'sg-4-num', type: 'text', x: 80, y: 391, text: '4.', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-4-title', type: 'text', x: 112, y: 391, text: 'SMS & Call Escalation', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-4-time', type: 'text', x: 636, y: 391, text: '45m–60m', color: '#fecaca', strokeWidth: 1 },
  { id: 'sg-4-desc', type: 'text', x: 112, y: 413, text: 'Twilio SMS Alert | Manual Call Backup', color: '#fee2e2', strokeWidth: 1 },

  // Step 5 - Dark Gray (60m+)
  { id: 'sg-5-bg', type: 'rectangle', x: 60, y: 470, width: 680, height: 65, color: '#374151', strokeWidth: 2 },
  { id: 'sg-5-num', type: 'text', x: 80, y: 486, text: '5.', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-5-title', type: 'text', x: 112, y: 486, text: 'Direct Engineer Escalation', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-5-time', type: 'text', x: 648, y: 486, text: '60m+', color: '#d1d5db', strokeWidth: 1 },
  { id: 'sg-5-desc', type: 'text', x: 112, y: 508, text: 'Direct Call to On-Call Engineer', color: '#9ca3af', strokeWidth: 1 },

  // Resolved - Blue
  { id: 'sg-res-bg', type: 'rectangle', x: 60, y: 565, width: 680, height: 65, color: '#1d4ed8', strokeWidth: 2 },
  { id: 'sg-res-icon', type: 'text', x: 82, y: 581, text: '✓', color: '#ffffff', strokeWidth: 2 },
  { id: 'sg-res-title', type: 'text', x: 120, y: 581, text: 'RESOLVED', color: '#ffffff', strokeWidth: 3 },
  { id: 'sg-res-desc', type: 'text', x: 82, y: 606, text: 'Issue Fixed & Incident Review completed', color: '#bfdbfe', strokeWidth: 1 },

  // Divider
  { id: 'sg-div', type: 'line', points: [{ x: 60, y: 660 }, { x: 740, y: 660 }], color: '#e5e7eb', strokeWidth: 1 },

  // Best Practices section
  { id: 'sg-bp-title', type: 'text', x: 80, y: 680, text: 'Key Principles', color: '#374151', strokeWidth: 2 },
  { id: 'sg-bp-1', type: 'text', x: 80, y: 710, text: '80/20 Rule: Test your Prompt templates thoroughly', color: '#6b7280', strokeWidth: 1 },
  { id: 'sg-bp-2', type: 'text', x: 80, y: 732, text: 'Schema Enforcement: Store data in structured State Schema', color: '#6b7280', strokeWidth: 1 },
  { id: 'sg-bp-3', type: 'text', x: 80, y: 754, text: 'Safety First: Use Action Budget to prevent runaway processes', color: '#6b7280', strokeWidth: 1 },
];

interface TemplatesModalProps {
  onClose: () => void;
}

export default function TemplatesModal({ onClose }: TemplatesModalProps) {
  const { setElements } = useCanvasStore();
  const { currentLanguage } = useLanguageStore();
  const t = useTranslation(currentLanguage);

  const templates: Template[] = [
    {
      id: 'workflow-diagram',
      nameKey: 'templateWorkflowName',
      descKey: 'templateWorkflowDesc',
      icon: <GitBranch className="w-6 h-6" />,
      color: 'bg-blue-500',
      badge: 'CI/CD',
      elements: WORKFLOW_DIAGRAM_ELEMENTS,
    },
    {
      id: 'step-guide',
      nameKey: 'templateStepGuideName',
      descKey: 'templateStepGuideDesc',
      icon: <AlignLeft className="w-6 h-6" />,
      color: 'bg-red-500',
      badge: 'Escalation',
      elements: STEP_GUIDE_ELEMENTS,
    },
    {
      id: 'api-documentation',
      nameKey: 'templateApiDocName',
      descKey: 'templateApiDocDesc',
      icon: <FileCode2 className="w-6 h-6" />,
      color: 'bg-slate-700',
      badge: 'API Docs',
      elements: API_DOC_ELEMENTS,
    },
  ];

  const handleApplyTemplate = (template: Template) => {
    const timestamped = template.elements.map((el, i) => ({
      ...el,
      id: `${el.id}-${Date.now()}-${i}`,
    }));
    setElements(timestamped);
    onClose();
  };

  const PREVIEW_MAP: Record<string, React.ReactNode> = {
    'workflow-diagram': (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        {/* Pipeline nodes */}
        {[
          { y: 8, color: '#2a7db5', label: 'Build & Test' },
          { y: 32, color: '#1a6b8a', label: 'Docker Build' },
          { y: 56, color: '#6d28d9', label: 'Staging Deploy' },
          { y: 80, color: '#d97706', label: 'Approval Gate' },
        ].map((item, i) => (
          <g key={i}>
            <rect x="50" y={item.y} width="100" height="18" rx="3" fill={item.color} />
            <text x="100" y={item.y + 13} textAnchor="middle" fill="white" fontSize="7" fontFamily="Inter">{item.label}</text>
            {i < 3 && <line x1="100" y1={item.y + 18} x2="100" y2={item.y + 24} stroke="#7c3aed" strokeWidth="1.5" markerEnd="url(#arr)" />}
          </g>
        ))}
        {/* Fork */}
        <line x1="100" y1="98" x2="40" y2="116" stroke="#2a7db5" strokeWidth="1.5" />
        <line x1="100" y1="98" x2="160" y2="116" stroke="#16a34a" strokeWidth="1.5" />
        <rect x="10" y="116" width="60" height="16" rx="3" fill="#2a7db5" />
        <text x="40" y="127" textAnchor="middle" fill="white" fontSize="6" fontFamily="Inter">Blue-Green</text>
        <rect x="130" y="116" width="60" height="16" rx="3" fill="#16a34a" />
        <text x="160" y="127" textAnchor="middle" fill="white" fontSize="6" fontFamily="Inter">Canary</text>
        {/* Merge */}
        <line x1="40" y1="132" x2="100" y2="142" stroke="#7c3aed" strokeWidth="1.5" />
        <line x1="160" y1="132" x2="100" y2="142" stroke="#7c3aed" strokeWidth="1.5" />
        <rect x="50" y="142" width="100" height="14" rx="3" fill="#dc2626" />
        <text x="100" y="153" textAnchor="middle" fill="white" fontSize="6" fontFamily="Inter">Notifications</text>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#7c3aed" />
          </marker>
        </defs>
      </svg>
    ),
    'api-documentation': (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        {/* Title */}
        <rect x="8" y="4" width="184" height="20" rx="3" fill="#1e293b" />
        <text x="100" y="17" textAnchor="middle" fill="#f8fafc" fontSize="6" fontFamily="Inter" fontWeight="600">API Documentation</text>
        {/* 4 section cards */}
        {[
          { x: 8, y: 30, w: 88, h: 50, color: '#1d4ed8', label: 'Endpoints', sub: 'GET POST PUT DELETE' },
          { x: 104, y: 30, w: 88, h: 50, color: '#065f46', label: 'Parameters', sub: 'Headers · Body · Query' },
          { x: 8, y: 88, w: 88, h: 50, color: '#7c3aed', label: 'Response', sub: '200 · 400 · 401 · 500' },
          { x: 104, y: 88, w: 88, h: 50, color: '#b45309', label: 'Auth', sub: 'API Key · OAuth · JWT' },
        ].map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="3" fill={s.color} />
            <text x={s.x + s.w / 2} y={s.y + 14} textAnchor="middle" fill="white" fontSize="7" fontFamily="Inter" fontWeight="600">{s.label}</text>
            <text x={s.x + s.w / 2} y={s.y + 28} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="5.5" fontFamily="Inter">{s.sub}</text>
          </g>
        ))}
        {/* Tools strip */}
        <line x1="8" y1="145" x2="192" y2="145" stroke="#e2e8f0" strokeWidth="0.8" />
        {[
          { x: 8, color: '#16a34a', label: 'Swagger' },
          { x: 76, color: '#dc2626', label: 'Postman' },
          { x: 144, color: '#0891b2', label: 'Redocly' },
        ].map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={148} width={56} height={10} rx="2" fill={t.color} />
            <text x={t.x + 28} y={155.5} textAnchor="middle" fill="white" fontSize="5.5" fontFamily="Inter">{t.label}</text>
          </g>
        ))}
      </svg>
    ),
    'step-guide': (
      <svg viewBox="0 0 200 160" className="w-full h-full">
        {[
          { color: '#15803d', label: '1. Initial Alert', time: '0–15m' },
          { color: '#ea580c', label: '2. PagerDuty', time: '15–30m' },
          { color: '#d97706', label: '3. Email', time: '30–45m' },
          { color: '#dc2626', label: '4. SMS & Call', time: '45–60m' },
          { color: '#374151', label: '5. Engineer', time: '60m+' },
          { color: '#1d4ed8', label: '✓ RESOLVED', time: '' },
        ].map((step, i) => (
          <g key={i}>
            <rect x="10" y={i * 24 + 4} width="180" height="18" rx="3" fill={step.color} />
            <text x="18" y={i * 24 + 16} fill="white" fontSize="7" fontFamily="Inter" fontWeight="600">{step.label}</text>
            <text x="178" y={i * 24 + 16} textAnchor="end" fill="rgba(255,255,255,0.8)" fontSize="6" fontFamily="Inter">{step.time}</text>
          </g>
        ))}
      </svg>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-secondary/40">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t('templates')}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t('templatesDesc')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Template Grid */}
        <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group border border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer bg-background"
              onClick={() => handleApplyTemplate(template)}
            >
              {/* Preview Area */}
              <div className="h-44 bg-secondary/50 p-3 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full">
                  {PREVIEW_MAP[template.id]}
                </div>
                {/* Badge */}
                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-white text-xs font-semibold ${template.color}`}>
                  {template.badge}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex items-start gap-3 border-t border-border bg-card group-hover:bg-secondary/30 transition-colors">
                <div className={`p-2 rounded-lg text-white shrink-0 ${template.color}`}>
                  {template.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {t(template.nameKey as any)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t(template.descKey as any)}
                  </p>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="px-4 pb-4">
                <div className="w-full py-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground text-primary text-sm font-medium text-center transition-all duration-200">
                  {t('applyTemplate')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-muted-foreground">{t('templateFooterHint')}</p>
        </div>
      </div>
    </div>
  );
}

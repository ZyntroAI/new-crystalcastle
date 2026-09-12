# ZyntroAI — คอมโพเนนต์มาตรฐาน (root-level JSX)

ไฟล์ทั้งหมดในชุดนี้ตั้งอยู่ที่ **โฟลเดอร์ราก** ของโปรเจกต์โดยตรง ตามงาน `TASK-ZYNTRAI-JSX-ROOT-001`

## รายการไฟล์

| ไฟล์ | สิ่งที่ให้ |
| --- | --- |
| `ZyntroAI.jsx` | จุดนำเข้ารวม (barrel) + อ็อบเจกต์ `ZyntroAI` |
| `ZyntroAIButton.jsx` | ปุ่ม — variant / size / loading / fullWidth |
| `ZyntroAICard.jsx` | การ์ด + Header / Title / Description / Content / Footer |
| `ZyntroAIBadge.jsx` | ป้ายกำกับสถานะ + จุดสถานะ (dot) |
| `ZyntroAILoader.jsx` | ตัวโหลด — spinner / dots / bar + fullscreen |
| `ZyntroAIAlert.jsx` | กล่องแจ้งเตือน + Title / Description |

## การนำไปใช้

```jsx
import { ZyntroAIButton, ZyntroAICard, ZyntroAICardContent } from "./ZyntroAI.jsx";
```

หรือนำเข้าแบบแยกไฟล์ (path เดียวกันคือ root ซึ่งเป็นโฟลเดอร์เดียวกับ `index.html`):

```jsx
import ZyntroAIButton from "./ZyntroAIButton.jsx";
```

## หลักการออกแบบ

- **ไม่ทับชื่อเดิม** — ทั้ง 6 ไฟล์ไม่มีชื่อชนกับไฟล์ `.jsx` เดิมที่ราก (`alert.jsx`, `button.js` ฯลฯ)
- **Standalone** — ไม่พึ่งพา path alias (`@/...`) เพื่อให้ย้าย/คัดลอกได้โดยไม่พัง
- **a11y** — ปุ่มมี `aria-busy`/`aria-disabled`, ตัวโหลดมี `role="status"` + `aria-live`, กล่องแจ้งเตือนมี `role` ตามระดับความรุนแรง
- **ไม่เพิ่ม dependency ใหม่** — ใช้เฉพาะ `react` ที่โปรเจกต์มีอยู่แล้ว

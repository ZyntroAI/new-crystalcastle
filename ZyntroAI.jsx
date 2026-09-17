/**
 * ZyntroAI — จุดนำเข้า (barrel) ของคอมโพเนนต์มาตรฐาน ZyntroAI
 * ทุกไฟล์ในชุดนี้อยู่ที่โฟลเดอร์ราก (root) โดยตรง
 *
 * ตัวอย่างการใช้งาน:
 *   import { ZyntroAIButton, ZyntroAICard } from "./ZyntroAI.jsx";
 *   // หรือ import แยกไฟล์
 *   import ZyntroAIButton from "./ZyntroAIButton.jsx";
 */
export { ZyntroAIButton, cx } from "./ZyntroAIButton.jsx";
export {
  ZyntroAICard,
  ZyntroAICardHeader,
  ZyntroAICardTitle,
  ZyntroAICardDescription,
  ZyntroAICardContent,
  ZyntroAICardFooter,
} from "./ZyntroAICard.jsx";
export { ZyntroAIBadge } from "./ZyntroAIBadge.jsx";
export { ZyntroAILoader } from "./ZyntroAILoader.jsx";
export {
  ZyntroAIAlert,
  ZyntroAIAlertTitle,
  ZyntroAIAlertDescription,
} from "./ZyntroAIAlert.jsx";

import ZyntroAIButton from "./ZyntroAIButton.jsx";
import ZyntroAICard from "./ZyntroAICard.jsx";
import ZyntroAIBadge from "./ZyntroAIBadge.jsx";
import ZyntroAILoader from "./ZyntroAILoader.jsx";
import ZyntroAIAlert from "./ZyntroAIAlert.jsx";

export const ZyntroAI = {
  Button: ZyntroAIButton,
  Card: ZyntroAICard,
  Badge: ZyntroAIBadge,
  Loader: ZyntroAILoader,
  Alert: ZyntroAIAlert,
};

export default ZyntroAI;

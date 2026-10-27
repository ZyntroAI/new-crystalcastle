import { useEffect, useRef } from 'react';
import { crossTabAuth } from './crossTabAuth';

// รายการ Event ที่นับว่าผู้ใช้ยังใช้งานอยู่
const INTERACTION_EVENTS = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
  'touchstart',
];

export const useIdleTimer = ({ onIdle, timeout = 15 * 60 * 1000 }) => { // ตั้งเวลาพื้นฐานไว้ที่ 15 นาที
  const timerRef = useRef(null);
  const lastEmittedRef = useRef(0);

  // ฟังก์ชันตั้งเวลาถอยหลัง Logout
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdle(); // ทำงานเมื่อหมดเวลา Idle
    }, timeout);
  };

  // ฟังก์ชันรีเซ็ตเวลา
  const resetTimer = (isLocalAction = true) => {
    startTimer();

    // หากเป็นการขยับหน้าจอใน Tab ปัจจุบัน ให้ส่งสัญญาณบอก Tab อื่นๆ
    if (isLocalAction) {
      const now = Date.now();
      // Throttle การส่ง Event ไม่ให้ยิงถี่เกินไป (ส่งไม่เกิน 1 ครั้ง ทุกๆ 2 วินาที)
      if (now - lastEmittedRef.current > 2000) {
        lastEmittedRef.current = now;
        crossTabAuth.emit('RESET_IDLE');
      }
    }
  };

  useEffect(() => {
    // 1. ตั้ง Timer เริ่มต้น
    startTimer();

    // 2. ผูก DOM Event เพื่อดักฟังการใช้งานใน Tab ปัจจุบัน
    const handleUserActivity = () => resetTimer(true);

    INTERACTION_EVENTS.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // 3. ดักฟังสัญญาณข้าม Tab
    const unsubscribe = crossTabAuth.subscribe((data) => {
      if (data.type === 'RESET_IDLE') {
        // เมื่อ Tab อื่นมีการขยับ ให้รีเซ็ตเวลาใน Tab นี้ตามด้วย (ไม่ต้องส่ง event ซ้ำ)
        resetTimer(false);
      }
    });

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      INTERACTION_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      unsubscribe();
    };
  }, [timeout]);
};

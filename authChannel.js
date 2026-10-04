const CHANNEL_NAME = 'auth_logout_channel';
const STORAGE_KEY = 'logout-event';

class CrossTabAuth {
  constructor() {
    this.hasBroadcastChannel = 'BroadcastChannel' in window;

    if (this.hasBroadcastChannel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
  }

  // 1. ส่งสัญญาณ Logout
  notifyLogout() {
    if (this.hasBroadcastChannel) {
      // ใช้ BroadcastChannel สำหรับ Browser ยุคใหม่
      this.channel.postMessage({ type: 'LOGOUT' });
    } else {
      // Fallback: เขียนค่าลง localStorage กระตุ้นให้เกิด storage event ใน Tab อื่น
      // ใส่ Date.now() เพื่อให้ค่ามีการเปลี่ยนแปลงเสมอ (หากค่าเดิมไม่เปลี่ยน Event จะไม่ทำงาน)
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }
  }

  // 2. ดักฟัง Event จาก Tab อื่นๆ
  onLogout(callback) {
    if (this.hasBroadcastChannel) {
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          callback();
        }
      };
    } else {
      // Fallback: ดักฟัง storage event
      this.storageListener = (event) => {
        // เช็กว่า Key ที่เปลี่ยนคือ logout-event หรือไม่
        if (event.key === STORAGE_KEY && event.newValue) {
          callback();
        }
      };
      window.addEventListener('storage', this.storageListener);
    }
  }

  // 3. ปิดการดักฟังเมื่อไม่ใช้งาน
  cleanup() {
    if (this.hasBroadcastChannel) {
      this.channel.close();
    } else if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }
}

export const crossTabAuth = new CrossTabAuth();

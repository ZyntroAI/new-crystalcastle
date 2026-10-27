const CHANNEL_NAME = 'auth_channel';
const STORAGE_KEY = 'auth-event';

class CrossTabAuth {
  constructor() {
    this.hasBroadcastChannel = 'BroadcastChannel' in window;
    if (this.hasBroadcastChannel) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
  }

  // ส่งสัญญาณไปยัง Tab อื่นๆ
  emit(type, payload = {}) {
    if (this.hasBroadcastChannel) {
      this.channel.postMessage({ type, ...payload });
    } else {
      // Fallback: ใช้ localStorage กระตุ้น storage event
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ type, timestamp: Date.now(), ...payload }));
    }
  }

  // ดักฟัง Event จาก Tab อื่นๆ
  subscribe(callback) {
    if (this.hasBroadcastChannel) {
      const handler = (event) => callback(event.data);
      this.channel.addEventListener('message', handler);
      return () => this.channel.removeEventListener('message', handler);
    } else {
      const handler = (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            callback(data);
          } catch (e) {
            console.error('Error parsing storage event', e);
          }
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  }
}

export const crossTabAuth = new CrossTabAuth();

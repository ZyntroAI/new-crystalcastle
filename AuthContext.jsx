import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { crossTabAuth } from './authChannel';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  // ฟังก์ชันดำเนินการ Logout ทั่วไป
  const handleLocalLogout = () => {
    setUser(null);
    setAccessToken(null);
    // ลบ Key ชั่วคราวที่ใช้แจ้งเตือนออก
    localStorage.removeItem('logout-event');
    window.location.href = '/login';
  };

  // ฟังก์ชัน Logout หลักเมื่อผู้ใช้กดปุ่มบน UI
  const logout = async () => {
    try {
      await api.post('/auth/logout'); // แจ้ง Server ลบ HttpOnly Cookie
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 1. ส่งสัญญาณแจ้ง Tab อื่นๆ ก่อน
      crossTabAuth.notifyLogout();

      // 2. ล้าง State ของ Tab ปัจจุบัน
      handleLocalLogout();
    }
  };

  // 🎧 ดักฟังสัญญาณ Logout ข้าม Tab
  useEffect(() => {
    crossTabAuth.onLogout(() => {
      console.log('ได้รับสัญญาณ Logout จาก Tab อื่น... กำลังทำ Sync');
      handleLocalLogout();
    });

    return () => {
      crossTabAuth.cleanup();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

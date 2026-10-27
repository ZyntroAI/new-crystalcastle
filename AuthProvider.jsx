import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { crossTabAuth } from './crossTabAuth';
import { useIdleTimer } from './useIdleTimer';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleLocalLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('auth-event');
    window.location.href = '/login';
  };

  const logout = async (isBroadcast = true) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (isBroadcast) {
        crossTabAuth.emit('LOGOUT');
      }
      handleLocalLogout();
    }
  };

  // 🕒 ใช้งาน Idle Timer (เช่น 15 นาที = 15 * 60 * 1000 ms)
  // ระบบจะนับเวลาเมื่อมี accessToken อยู่เท่านั้น
  useIdleTimer({
    onIdle: () => {
      if (accessToken) {
        console.log('ไม่มีการใช้งานเกินเวลาที่กำหนด... กำลัง Auto Logout');
        logout();
      }
    },
    timeout: 15 * 60 * 1000, 
  });

  // 🎧 ดักฟังสัญญาณ LOGOUT จาก Tab อื่น
  useEffect(() => {
    const unsubscribe = crossTabAuth.subscribe((data) => {
      if (data.type === 'LOGOUT') {
        handleLocalLogout();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

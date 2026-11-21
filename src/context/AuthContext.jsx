import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลผู้ใช้เมื่อเปิดแอป
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // เข้าสู่ระบบ
  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    return res.data;
  };

  // ออกจากระบบ
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

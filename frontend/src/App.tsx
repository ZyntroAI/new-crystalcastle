import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [agentOnline, setAgentOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // ตรวจสอบสถานะทุก 5 วินาที
  useEffect(() => {
    const check = async () => {
      try {
        const r = await axios.get(`${API}/health`);
        setAgentOnline(r.data.agent?.status === 'online');
      } catch {
        setAgentOnline(false);
      }
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []);

  const loadTasks = async () => {
    try {
      const r = await axios.get(`${API}/tasks`);
      setTasks(r.data);
    } catch {}
  };

  useEffect(() => { loadTasks(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/delegate-task`, null, {
        params: { name, description: desc }
      });
      setName(''); setDesc('');
      await loadTasks();
    } catch (err) {
      alert('❌ ส่งงานไม่สำเร็จ: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui', padding: 20 }}>
      <h1>🤖 ZyntroAI Control Panel</h1>

      {/* สถานะระบบ */}
      <div style={{
        padding: 12, borderRadius: 8, marginBottom: 20,
        background: agentOnline ? '#dcfce7' : '#fee2e2',
        color: agentOnline ? '#166534' : '#991b1b'
      }}>
        {agentOnline === null ? '⏳ กำลังตรวจสอบ...' :
         agentOnline ? '✅ Agent ออนไลน์ — พร้อมรับงาน' :
         '🔴 Agent ออฟไลน์ — รัน apps/agent ก่อน'}
      </div>

      {/* ฟอร์มส่งงาน */}
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="ชื่องาน (จำเป็น)"
          style={{ padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <textarea
          value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="รายละเอียดงาน" rows={3}
          style={{ padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button disabled={loading || !name.trim()}
          style={{ padding: 12, background: '#00D1C1', border: 'none', borderRadius: 6,
                   color: '#2A3447', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
          {loading ? '⏳ กำลังส่ง...' : '📤 มอบหมายงานให้ Agent'}
        </button>
      </form>

      {/* รายการงาน */}
      <h2>📋 รายการงาน ({tasks.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          <div key={t.id} style={{
            padding: 12, border: '1px solid #e2e8f0', borderRadius: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <strong>{t.name}</strong>
              <div style={{ fontSize: 13, color: '#64748b' }}>{t.description || '—'}</div>
            </div>
            <span style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 12,
              background: '#fef3c7', color: '#92400e'
            }}>{t.status}</span>
          </div>
        ))}
        {tasks.length === 0 && <p style={{ color: '#94a3b8' }}>ยังไม่มีงาน — ส่งงานแรกเลย!</p>}
      </div>
    </div>
  );
}

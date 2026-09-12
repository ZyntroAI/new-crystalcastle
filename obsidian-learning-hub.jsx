import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  CheckCircle,
  Circle,
  Clock,
  Search,
  ChevronRight,
  ChevronDown,
  Star,
  Tag,
  Plus,
  Database,
  Globe,
  RefreshCw,
  Play,
  BookMarked,
  ExternalLink
} from 'lucide-react';

// ==============================================
// ⚙️ คอนฟิก & โครงสร้างข้อมูลหลัก
// ==============================================
export const OBSIDIAN_LEARNING_CONFIG = {
  vaultPrefix: 'Learning/',
  apiBase: '/api/v1/learning',
  syncInterval: 5000,
  sources: [
    { id: 'local', label: 'บันทึกในเครื่อง', icon: Database, color: '#3b82f6' },
    { id: 'mslearn', label: 'Microsoft Learn', icon: Globe, color: '#8b5cf6' },
    { id: 'docs', label: 'เอกสารระบบ', icon: FileText, color: '#10b981' }
  ],
  statusTypes: {
    not_started: { label: 'ยังไม่เริ่ม', icon: Circle, color: 'text-slate-400' },
    in_progress: { label: 'กำลังเรียน', icon: Clock, color: 'text-blue-500' },
    completed: { label: 'เสร็จสิ้น', icon: CheckCircle, color: 'text-green-500' },
    bookmarked: { label: 'บุ๊กมาร์ก', icon: Star, color: 'text-amber-500' }
  }
};

// ==============================================
// 🧮 ฟังก์ชันบริสุทธิ์ (ทดสอบได้ / export เพื่อ reuse)
// ==============================================
export const computeStats = (list) => {
  const items = Array.isArray(list) ? list : [];
  const total = items.length;
  const completed = items.filter((m) => m.status === 'completed').length;
  return {
    total,
    completed,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

export const filterModules = (modules, search, filter) => {
  const q = (search || '').toLowerCase();
  return (Array.isArray(modules) ? modules : []).filter((m) => {
    const title = (m.title || '').toLowerCase();
    const matchSearch =
      title.includes(q) || (m.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchSource = filter.source === 'all' || m.source === filter.source;
    const matchStatus = filter.status === 'all' || m.status === filter.status;
    return matchSearch && matchSource && matchStatus;
  });
};

export const getSource = (id) =>
  OBSIDIAN_LEARNING_CONFIG.sources.find((s) => s.id === id) || OBSIDIAN_LEARNING_CONFIG.sources[0];

export const getStatus = (id) => OBSIDIAN_LEARNING_CONFIG.statusTypes[id] || { label: 'ไม่ทราบสถานะ' };

// ==============================================
// 🪝 Custom Hook: จัดการข้อมูลการเรียน & Vault
// ==============================================
export const useObsidianLearning = () => {
  const [modules, setModules] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, progress: 0 });
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [modRes, folderRes] = await Promise.all([
        fetch(`${OBSIDIAN_LEARNING_CONFIG.apiBase}/modules`),
        fetch(`${OBSIDIAN_LEARNING_CONFIG.apiBase}/folders`)
      ]);

      const modData = await modRes.json();
      const folderData = await folderRes.json();

      const nextModules = modData.modules || [];
      setModules(nextModules);
      setFolders(folderData.folders || folderData || []);
      setStats(computeStats(nextModules));
      setError(null);
    } catch (e) {
      console.error('โหลดข้อมูลการเรียนล้มเหลว', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncVault = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch(`${OBSIDIAN_LEARNING_CONFIG.apiBase}/sync`, { method: 'POST' });
      await fetchData();
    } catch (e) {
      console.error('ซิงค์ Vault ล้มเหลว', e);
      setError(e);
    } finally {
      setSyncing(false);
    }
  }, [fetchData]);

  const updateStatus = useCallback(async (id, status) => {
    // อัปเดต UI ก่อน แล้วค่อยคำนวณสถิติจากรายการใหม่ (ไม่ใช่ state เก่า)
    setModules((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, status } : m));
      setStats(computeStats(next));
      return next;
    });

    try {
      await fetch(`${OBSIDIAN_LEARNING_CONFIG.apiBase}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
    } catch (e) {
      console.error('อัปเดตสถานะล้มเหลว', e);
    }
  }, []);

  const addNote = useCallback(async (moduleId, content) => {
    await fetch(`${OBSIDIAN_LEARNING_CONFIG.apiBase}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, content })
    });
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, OBSIDIAN_LEARNING_CONFIG.syncInterval);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    modules,
    folders,
    stats,
    syncing,
    loading,
    error,
    fetchData,
    syncVault,
    updateStatus,
    addNote
  };
};

// ==============================================
// 🧩 คอมโพเนนต์ย่อย: แถบสถิติภาพรวม
// ==============================================
export const LearningStatsBar = ({ stats }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
      <p className="text-sm text-slate-500 mb-1">📚 ทั้งหมด</p>
      <p className="text-2xl font-bold">{stats.total} หัวข้อ</p>
    </div>
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
      <p className="text-sm text-slate-500 mb-1">✅ เสร็จแล้ว</p>
      <p className="text-2xl font-bold text-green-600">{stats.completed} รายการ</p>
    </div>
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
      <p className="text-sm text-slate-500 mb-1">📈 ความคืบหน้า</p>
      <p className="text-2xl font-bold text-blue-600">{stats.progress}%</p>
    </div>
  </div>
);

// ==============================================
// 🧩 คอมโพเนนต์ย่อย: การ์ดแสดงโมดูล/บทเรียน
// ==============================================
export const LearningModuleCard = ({ module, onStatusChange, expanded, onToggle }) => {
  const statusInfo = getStatus(module.status);
  const sourceInfo = getSource(module.source);

  // JSX ต้องการตัวแปรชี้ component (ไม่ใช่ member expression แบบ sourceInfo.icon)
  const StatusIcon = statusInfo.icon;
  const SourceIcon = sourceInfo.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* หัวการ์ด */}
      <button
        type="button"
        aria-expanded={expanded}
        className="w-full text-left p-5 flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${sourceInfo.color}15` }}>
            <SourceIcon className="w-5 h-5" style={{ color: sourceInfo.color }} />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {module.title}
            </h3>
            <p className="text-sm text-slate-500">{module.path || 'ไม่มีตำแหน่ง'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm flex items-center gap-1.5 ${statusInfo.color}`}>
            {StatusIcon && <StatusIcon className="w-4 h-4" />}
            {statusInfo.label}
          </span>
          {module.url && (
            <a
              href={module.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={(e) => e.stopPropagation()}
              aria-label={`เปิดลิงก์ ${module.title}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </button>

      {/* รายละเอียดเมื่อขยาย */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-5 space-y-4">
          {module.description && (
            <p className="text-slate-700 dark:text-slate-300 text-sm">{module.description}</p>
          )}

          {/* แท็ก */}
          {module.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {module.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* การดำเนินการ & เปลี่ยนสถานะ */}
          <div className="flex justify-between items-center pt-2">
            <select
              value={module.status}
              onChange={(e) => onStatusChange(module.id, e.target.value)}
              aria-label={`สถานะของ ${module.title}`}
              className="text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent"
            >
              {Object.entries(OBSIDIAN_LEARNING_CONFIG.statusTypes).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> เปิดบันทึก
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> เริ่มเรียน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================
// 🧩 แถบกรอง & ค้นหา
// ==============================================
export const LearningFilterBar = ({ filter, setFilter, search, setSearch }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        placeholder="ค้นหาบทเรียน, หัวข้อ หรือแท็ก..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="ค้นหาบทเรียน"
        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-transparent"
      />
    </div>
    <div className="flex gap-3">
      <select
        value={filter.source}
        onChange={(e) => setFilter((p) => ({ ...p, source: e.target.value }))}
        aria-label="กรองตามแหล่งที่มา"
        className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-transparent"
      >
        <option value="all">ทุกแหล่ง</option>
        {OBSIDIAN_LEARNING_CONFIG.sources.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <select
        value={filter.status}
        onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))}
        aria-label="กรองตามสถานะ"
        className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-transparent"
      >
        <option value="all">ทุกสถานะ</option>
        {Object.entries(OBSIDIAN_LEARNING_CONFIG.statusTypes).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
    </div>
  </div>
);

// ==============================================
// 🚀 คอมโพเนนต์หลัก: Obsidian Learning Hub
// ==============================================
const ObsidianLearningHub = () => {
  const { modules, stats, syncing, syncVault, updateStatus } = useObsidianLearning();
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ source: 'all', status: 'all' });

  const filteredModules = useMemo(
    () => filterModules(modules, search, filter),
    [modules, search, filter]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ส่วนหัวหลัก */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <BookMarked className="w-7 h-7 text-blue-600" />
              Obsidian Learning Hub
            </h1>
            <p className="text-slate-500 mt-1">
              บูรณาการบันทึกใน Vault + Microsoft Learn + เอกสารระบบ
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={syncVault}
              disabled={syncing}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'กำลังซิงค์...' : 'ซิงค์ Vault'}
            </button>
            <button
              type="button"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> เพิ่มบทเรียน
            </button>
          </div>
        </header>

        {/* สถิติภาพรวม */}
        <LearningStatsBar stats={stats} />

        {/* ตัวกรอง & ค้นหา */}
        <LearningFilterBar
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />

        {/* รายการบทเรียน/โมดูล */}
        <div className="space-y-4">
          {filteredModules.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>ไม่พบรายการที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <LearningModuleCard
                key={module.id}
                module={module}
                expanded={expandedId === module.id}
                onToggle={() => setExpandedId(expandedId === module.id ? null : module.id)}
                onStatusChange={updateStatus}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObsidianLearningHub;

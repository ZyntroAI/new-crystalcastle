import { useState } from 'react';
import axios from 'axios';

type SearchResult = {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: any[];
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/items/search', {
        q: query || undefined,
        status: status || undefined,
        page,
        limit: 15,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="🔍 ค้นหา..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="in_progress">กำลังทำ</option>
          <option value="done">เสร็จสิ้น</option>
        </select>
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? '...' : 'ค้นหา'}
        </button>
      </div>

      {results && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-3">
            พบ {results.total} รายการ · หน้า {results.page}/{results.total_pages}
          </p>
          <div className="space-y-2">
            {results.items.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.status === 'done' ? 'bg-green-100 text-green-700' :
                  item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

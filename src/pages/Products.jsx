import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      setProducts(res.data.data || []);
    } catch (err) {
      setError('โหลดข้อมูลไม่สำเร็จ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>⏳ กำลังโหลด...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>รายการสินค้า</h1>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {products.length === 0 ? (
          <p>ไม่มีรายการ</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <h3>{p.name}</h3>
              <p>💰 ราคา: {p.price.toLocaleString()} บาท</p>
              <p>📦 คงเหลือ: {p.quantity} ชิ้น</p>
              <p>สถานะ: {p.status === 'available' ? 'มีจำหน่าย' : 'หมด'}</p>
              {user && p.createdBy === user.id && (
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  🗑️ ลบ
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

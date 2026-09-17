// CounterWithHistory.tsx
import { useState, useCallback } from 'react';

export default function CounterWithHistory() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<number[]>([]);

  const update = useCallback((delta: number) => {
    const next = count + delta * step;
    setCount(next);
    setHistory(prev => [...prev.slice(-9), next]);
  }, [count, step]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: 24, maxWidth: 360, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 64, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        <button onClick={() => update(-1)} style={btnStyle}>-</button>
        <button onClick={() => { setCount(0); setHistory([]); }} style={btnStyle}>Reset</button>
        <button onClick={() => update(1)} style={btnStyle}>+</button>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[1, 5, 10].map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            style={{
              ...stepBtnStyle,
              background: step === s ? '#0f172a' : 'transparent',
              color: step === s ? '#fff' : '#64748b',
              borderColor: step === s ? '#0f172a' : '#e2e8f0',
            }}
          >
            +{s}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 20, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          History: {history.join(' → ')}
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: '1px solid #e2e8f0',
  background: 'transparent',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 18,
};

const stepBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  transition: 'all 0.15s',
};

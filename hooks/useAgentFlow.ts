import { useState, useCallback } from 'react';

export type AgentState = 'planning' | 'executing' | 'validating' | 'repairing' | 'completing' | 'failed';

const TIMEOUT_MS = 30000;

export function useAgentFlow() {
  const [state, setState] = useState<AgentState>('planning');
  const [error, setError] = useState<string | null>(null);

  const transition = useCallback((next: AgentState) => {
    setState(next);
    // Auto-timeout สำหรับสถานะที่ต้องรอ
    if (next === 'planning' || next === 'repairing') {
      setTimeout(() => setState(s => s === next ? 'failed' : s), TIMEOUT_MS);
    }
  }, []);

  const fail = useCallback((msg: string) => {
    setError(msg);
    setState('failed');
  }, []);

  return { state, error, transition, fail };
}

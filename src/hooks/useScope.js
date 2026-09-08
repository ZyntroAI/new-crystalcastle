import { useMemo, useRef, useEffect, useState, useCallback } from 'react';

// 🔑 Global Registry & Event Bus
const SCOPE_REGISTRY = new Map();
const SCOPE_EVENTS = new EventTarget();

/**
 * 🎯 useScope — Isolated State Manager
 * @param {string} scopeId — Unique ID
 * @param {object} initialData — Default state
 * @param {object} options — { persist: boolean, deps: any[] }
 * @returns {object} { data, setData, update, reset, isActive, meta }
 */
export function useScope(scopeId, initialData = {}, options = {}) {
  const { persist = false, deps = [] } = options;
  const scopeRef = useRef({ id: scopeId, data: initialData });
  const [, forceRender] = useState(0);

  // 🧱 Initialize + refCount tracking
  useMemo(() => {
    if (!SCOPE_REGISTRY.has(scopeId)) {
      SCOPE_REGISTRY.set(scopeId, {
        data: initialData,
        createdAt: Date.now(),
        refCount: 0
      });
    }
    const entry = SCOPE_REGISTRY.get(scopeId);
    entry.refCount++;
    scopeRef.current.data = entry.data;
  }, [scopeId, ...deps]);

  // 🧰 Shallow Equality
  const isShallowEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    const keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k => a[k] === b[k]);
  };

  // ✅ Full Update — Fixed Dedup (#1)
  const setData = useCallback((newData) => {
    const entry = SCOPE_REGISTRY.get(scopeId);
    if (!entry) return;
    const current = entry.data;
    const next = typeof newData === 'function' ? newData(current) : newData;
    const merged = { ...current, ...next };

    if (isShallowEqual(current, merged)) return;

    entry.data = merged;
    scopeRef.current.data = merged;
    SCOPE_EVENTS.dispatchEvent(new CustomEvent(`scope:${scopeId}`, { detail: merged }));
    forceRender(n => n + 1);
  }, [scopeId]);

  // 📌 Partial Patch
  const update = useCallback((patch) => {
    setData(prev => ({ ...prev, ...patch }));
  }, [setData]);

  // 🔄 Reset
  const reset = useCallback(() => {
    setData(initialData);
  }, [scopeId, initialData]);

  // 📡 Auto-Subscribe — Fixed Sync (#3)
  useEffect(() => {
    const handler = e => {
      scopeRef.current.data = e.detail;
      forceRender(n => n + 1);
    };
    SCOPE_EVENTS.addEventListener(`scope:${scopeId}`, handler);
    return () => SCOPE_EVENTS.removeEventListener(`scope:${scopeId}`, handler);
  }, [scopeId]);

  // 🧹 Cleanup — Fixed refCount (#4)
  useEffect(() => {
    return () => {
      const entry = SCOPE_REGISTRY.get(scopeId);
      if (!entry) return;
      entry.refCount--;
      if (entry.refCount <= 0 && !persist) {
        SCOPE_REGISTRY.delete(scopeId);
        SCOPE_EVENTS.dispatchEvent(new CustomEvent(`scope:${scopeId}:clear`));
      }
    };
  }, [scopeId, persist]);

  // 📊 Meta — No Mutation (#2)
  const meta = useMemo(() => {
    const entry = SCOPE_REGISTRY.get(scopeId);
    return {
      isActive: !!entry,
      createdAt: entry?.createdAt,
      refCount: entry?.refCount ?? 0
    };
  }, [scopeId]);

  return useMemo(() => ({
    scopeId,
    data: scopeRef.current.data,
    setData,
    update,
    reset,
    ...meta
  }), [scopeId, setData, update, reset, meta]);
}

// 📂 Bulk Selector
export function useScopes(scopeIds = []) {
  return useMemo(() => ({
    getAll: () => scopeIds.map(id => SCOPE_REGISTRY.get(id)?.data),
    get: id => SCOPE_REGISTRY.get(id)?.data,
    has: id => SCOPE_REGISTRY.has(id)
  }), [scopeIds.join('|')]);
}

// 🧹 Global Clear
export function clearAllScopes() {
  SCOPE_REGISTRY.clear();
  SCOPE_EVENTS.dispatchEvent(new CustomEvent('scopes:cleared'));
}

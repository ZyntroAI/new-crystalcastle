import { useMemo, useRef, useEffect, useState, useCallback } from 'react';

// ============================================================
// 🧩 Types
// ============================================================
type ScopeId = string;
type ScopeData = Record<string, unknown>;
type Updater<T> = Partial<T> | ((prev: T) => Partial<T>);
type Listener<T> = (data: T) => void;

interface ScopeOptions<T> {
  persist?: boolean;        // Save to localStorage
  isolate?: boolean;        // Prevent cross-scope leakage
  key?: string;             // localStorage key override
  deps?: unknown[];         // External dependencies
  initializer?: () => T;    // Lazy initializer
}

interface ScopeAPI<T> {
  scopeId: string;
  data: T;
  setData: (updater: Updater<T>) => void;
  update: (patch: Partial<T>) => void;
  reset: () => void;
  subscribe: (callback: Listener<T>) => () => void;
  isActive: boolean;
  createdAt: number;
  accessCount: number;
}

type Selector<T, R> = (state: T) => R;

// ============================================================
// 🔑 Internal Registry
// ============================================================
interface ScopeEntry<T = ScopeData> {
  data: T;
  createdAt: number;
  accessCount: number;
}

const SCOPE_REGISTRY = new Map<ScopeId, ScopeEntry>();
const SCOPE_EVENTS = new EventTarget();

const LS_PREFIX = 'scope:';
const getStorageKey = (id: string) => `${LS_PREFIX}${id}`;

// ============================================================
// 🧰 Helpers
// ============================================================
function isShallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => a[key] === b[key]);
}

function saveToStorage<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function loadFromStorage<T>(key: string): Partial<T> | null {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

// ============================================================
// 🪝 Main Hook
// ============================================================
export function useScope<T extends ScopeData>(
  scopeId: string,
  initialData: T | (() => T),
  options: ScopeOptions<T> = {}
): ScopeAPI<T> {
  const { persist = false, isolate = true, key, deps = [], initializer } = options;
  const storageKey = key ?? getStorageKey(scopeId);

  // Lazy initial value
  const resolvedInitial = useMemo((): T => {
    const base = initializer ? initializer()
      : typeof initialData === 'function' ? (initialData as () => T)() : initialData;
    return persist ? { ...base, ...loadFromStorage<T>(storageKey) } : base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId, storageKey, persist, ...deps]);

  const scopeRef = useRef<{ id: string; data: T }>({ id: scopeId, data: resolvedInitial });
  const [, forceRender] = useState(0);

  // Register / Hydrate
  useMemo(() => {
    if (!SCOPE_REGISTRY.has(scopeId)) {
      SCOPE_REGISTRY.set(scopeId, {
        data: resolvedInitial,
        createdAt: Date.now(),
        accessCount: 0
      });
    }
    scopeRef.current.data = SCOPE_REGISTRY.get(scopeId)!.data as T;
  }, [scopeId, resolvedInitial]);

  // ✅ setData
  const setData = useCallback((updater: Updater<T>) => {
    const entry = SCOPE_REGISTRY.get(scopeId);
    if (!entry) return;

    const current = entry.data as T;
    const patch = typeof updater === 'function' ? updater(current) : updater;
    const next = { ...current, ...patch } as T;

    if (isShallowEqual(current, next)) return;

    entry.data = next;
    scopeRef.current.data = next;
    if (persist) saveToStorage(storageKey, next);
    SCOPE_EVENTS.dispatchEvent(new CustomEvent(`scope:${scopeId}`, { detail: next }));
    forceRender(n => n + 1);
  }, [scopeId, persist, storageKey]);

  // 📌 update
  const update = useCallback((patch: Partial<T>) => {
    setData(patch);
  }, [setData]);

  // 🔄 reset
  const reset = useCallback(() => {
    if (persist) localStorage.removeItem(storageKey);
    setData(() => resolvedInitial);
  }, [setData, resolvedInitial, persist, storageKey]);

  // 📡 subscribe
  const subscribe = useCallback((callback: Listener<T>) => {
    const handler = (e: Event) => callback((e as CustomEvent<T>).detail);
    SCOPE_EVENTS.addEventListener(`scope:${scopeId}`, handler);
    return () => SCOPE_EVENTS.removeEventListener(`scope:${scopeId}`, handler);
  }, [scopeId]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      if (!persist && !isolate) {
        SCOPE_REGISTRY.delete(scopeId);
        localStorage.removeItem(storageKey);
      }
    };
  }, [scopeId, persist, isolate, storageKey]);

  // 📊 Metadata
  const meta = useMemo(() => {
    const entry = SCOPE_REGISTRY.get(scopeId);
    return {
      isActive: !!entry,
      createdAt: entry?.createdAt ?? Date.now(),
      accessCount: entry ? ++entry.accessCount : 0
    };
  }, [scopeId]);

  return useMemo(() => ({
    scopeId,
    data: scopeRef.current.data,
    setData,
    update,
    reset,
    subscribe,
    ...meta
  }), [scopeId, setData, update, reset, subscribe, meta]);
}

// ============================================================
// 🎯 useSelector — Redux-style Selectors
// ============================================================
export function useSelector<T extends ScopeData, R = T>(
  scopeId: string,
  selector?: Selector<T, R>,
  equalityFn: (a: R, b: R) => boolean = Object.is
): R {
  const initialData = useMemo(() => {
    const entry = SCOPE_REGISTRY.get(scopeId);
    return (entry?.data ?? {}) as T;
  }, [scopeId]);

  const selectedRef = useRef<R>(selector ? selector(initialData) : (initialData as unknown as R));
  const [, forceRender] = useState(0);

  useEffect(() => {
    return useScope(scopeId, initialData).subscribe((data) => {
      const next = selector ? selector(data) : (data as unknown as R);
      if (!equalityFn(selectedRef.current, next)) {
        selectedRef.current = next;
        forceRender(n => n + 1);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeId, selector, equalityFn]);

  return selectedRef.current;
}

// ============================================================
// 📂 Bulk Utilities
// ============================================================
export function useScopes(scopeIds: string[]) {
  return useMemo(() => ({
    getAll: () => scopeIds.map(id => SCOPE_REGISTRY.get(id)?.data),
    get: (id: string) => SCOPE_REGISTRY.get(id)?.data,
    has: (id: string) => SCOPE_REGISTRY.has(id)
  }), [scopeIds.join('|')]);
}

export function clearAllScopes(persistedToo = false): void {
  SCOPE_REGISTRY.forEach((_, id) => {
    if (persistedToo || !id.startsWith('persist:')) {
      localStorage.removeItem(getStorageKey(id));
    }
  });
  SCOPE_REGISTRY.clear();
  SCOPE_EVENTS.dispatchEvent(new CustomEvent('scopes:cleared'));
}

import { useCallback, useEffect, useState } from "react";
import type { OnboardingState, ProjectData } from "@/types/onboarding";

const STORAGE_KEY = "forge-onboarding-v1";
const MAX_STEP = 4;

const DEFAULT_STATE: OnboardingState = {
  step: 0,
  project: { appType: "", audience: "", goal: "" },
  features: [],
};

function load(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as OnboardingState) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(load);

  // persist state
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Failed to save onboarding state:", err);
    }
  }, [state]);

  // navigation
  const goTo = useCallback((step: number) => {
    setState((s) => ({ ...s, step: Math.max(0, Math.min(MAX_STEP, step)) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const next = useCallback(() => goTo(state.step + 1), [goTo, state.step]);
  const back = useCallback(() => goTo(state.step - 1), [goTo, state.step]);

  // update project info
  const updateProject = useCallback((patch: Partial<ProjectData>) => {
    setState((s) => ({ ...s, project: { ...s.project, ...patch } }));
  }, []);

  // toggle features
  const toggleFeature = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      features: s.features.includes(id)
        ? s.features.filter((f) => f !== id)
        : [...s.features, id],
    }));
  }, []);

  // reset state
  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // clear storage completely
  const clearStorage = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    goTo,
    next,
    back,
    updateProject,
    toggleFeature,
    reset,
    clearStorage,
  };
}

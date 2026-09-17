import { useCallback, useEffect, useState } from "react";
import type { OnboardingState, ProjectData } from "@/types/onboarding";

const STORAGE_KEY = "forge-onboarding-v1";

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

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const goTo = useCallback((step: number) => {
    setState((s) => ({ ...s, step: Math.max(0, Math.min(4, step)) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const next = useCallback(() => goTo(state.step + 1), [goTo, state.step]);
  const back = useCallback(() => goTo(state.step - 1), [goTo, state.step]);

  const updateProject = useCallback((patch: Partial<ProjectData>) => {
    setState((s) => ({ ...s, project: { ...s.project, ...patch } }));
  }, []);

  const toggleFeature = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      features: s.features.includes(id)
        ? s.features.filter((f) => f !== id)
        : [...s.features, id],
    }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { state, goTo, next, back, updateProject, toggleFeature, reset };
}

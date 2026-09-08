import React from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";

const steps = ["Intro", "Project Setup", "Features", "Review", "Finish"];

export default function OnboardingWizard() {
  const { state, next, back, goTo, reset, updateProject, toggleFeature } = useOnboarding();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-card rounded-lg shadow-md">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Onboarding Wizard</h2>
        <span className="text-sm text-muted-foreground">
          Step {state.step + 1} of {steps.length}
        </span>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2">
        {steps.map((label, i) => (
          <Button
            key={i}
            variant={i === state.step ? "default" : "outline"}
            size="sm"
            onClick={() => goTo(i)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-4 border rounded-md bg-muted/30">
        {state.step === 0 && (
          <p className="text-sm">👋 Welcome! Let's get started with your project.</p>
        )}
        {state.step === 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Project Setup</p>
            <input
              type="text"
              placeholder="App Type"
              value={state.project.appType}
              onChange={(e) => updateProject({ appType: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Audience"
              value={state.project.audience}
              onChange={(e) => updateProject({ audience: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Goal"
              value={state.project.goal}
              onChange={(e) => updateProject({ goal: e.target.value })}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        )}
        {state.step === 2 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Select Features</p>
            {["dark-mode", "notifications", "analytics"].map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.features.includes(f)}
                  onChange={() => toggleFeature(f)}
                />
                {f}
              </label>
            ))}
          </div>
        )}
        {state.step === 3 && (
          <div>
            <p className="text-sm font-medium">Review</p>
            <pre className="text-xs bg-muted p-2 rounded">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
        )}
        {state.step === 4 && (
          <p className="text-sm">🎉 All done! Your onboarding is complete.</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={reset}>Reset</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={back} disabled={state.step === 0}>
            Back
          </Button>
          <Button onClick={next} disabled={state.step === steps.length - 1}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

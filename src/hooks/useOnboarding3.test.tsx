import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import OnboardingWizard from "./useOnboarding3";
import type { OnboardingState } from "@/types/onboarding";

// The wizard delegates all state management to `useOnboarding` and delegates
// button rendering to the shared `Button` component. Neither of those was
// added/changed by this PR, so they are mocked out here to keep these tests
// focused exclusively on the behavior of `OnboardingWizard` itself.
const {
  mockNext,
  mockBack,
  mockGoTo,
  mockReset,
  mockUpdateProject,
  mockToggleFeature,
  getState,
  setState,
} = vi.hoisted(() => {
  let state: OnboardingState = {
    step: 0,
    project: { appType: "", audience: "", goal: "" },
    features: [],
  };
  return {
    mockNext: vi.fn(),
    mockBack: vi.fn(),
    mockGoTo: vi.fn(),
    mockReset: vi.fn(),
    mockUpdateProject: vi.fn(),
    mockToggleFeature: vi.fn(),
    getState: () => state,
    setState: (next: OnboardingState) => {
      state = next;
    },
  };
});

vi.mock("@/hooks/useOnboarding", () => ({
  useOnboarding: () => ({
    state: getState(),
    next: mockNext,
    back: mockBack,
    goTo: mockGoTo,
    reset: mockReset,
    updateProject: mockUpdateProject,
    toggleFeature: mockToggleFeature,
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, ...rest }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...rest}
    >
      {children}
    </button>
  ),
}));

const DEFAULT_STATE: OnboardingState = {
  step: 0,
  project: { appType: "", audience: "", goal: "" },
  features: [],
};

function renderWizard(state: OnboardingState = DEFAULT_STATE) {
  setState(state);
  return render(<OnboardingWizard />);
}

describe("OnboardingWizard (useOnboarding3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setState(DEFAULT_STATE);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the wizard header with the current step count", () => {
    renderWizard({ ...DEFAULT_STATE, step: 2 });
    expect(screen.getByText("Onboarding Wizard")).toBeInTheDocument();
    expect(screen.getByText("Step 3 of 5")).toBeInTheDocument();
  });

  it("renders a step-indicator button for every step", () => {
    renderWizard();
    ["Intro", "Project Setup", "Features", "Review", "Finish"].forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("marks only the active step's indicator with the default variant", () => {
    renderWizard({ ...DEFAULT_STATE, step: 2 });
    expect(screen.getByRole("button", { name: "Features" })).toHaveAttribute(
      "data-variant",
      "default"
    );
    expect(screen.getByRole("button", { name: "Intro" })).toHaveAttribute(
      "data-variant",
      "outline"
    );
    expect(screen.getByRole("button", { name: "Review" })).toHaveAttribute(
      "data-variant",
      "outline"
    );
  });

  it("calls goTo with the clicked step index when a step indicator is clicked", () => {
    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(mockGoTo).toHaveBeenCalledWith(3);
  });

  it("renders the welcome message on step 0 and hides other steps' content", () => {
    renderWizard({ ...DEFAULT_STATE, step: 0 });
    expect(screen.getByText(/Welcome! Let's get started/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("App Type")).not.toBeInTheDocument();
    expect(screen.queryByText(/All done!/)).not.toBeInTheDocument();
  });

  describe("step 1 - project setup", () => {
    it("pre-fills inputs with existing project data", () => {
      renderWizard({
        ...DEFAULT_STATE,
        step: 1,
        project: { appType: "SaaS", audience: "Developers", goal: "Ship faster" },
      });
      expect(screen.getByPlaceholderText("App Type")).toHaveValue("SaaS");
      expect(screen.getByPlaceholderText("Audience")).toHaveValue("Developers");
      expect(screen.getByPlaceholderText("Goal")).toHaveValue("Ship faster");
    });

    it("calls updateProject with the appType patch when the App Type input changes", () => {
      renderWizard({ ...DEFAULT_STATE, step: 1 });
      fireEvent.change(screen.getByPlaceholderText("App Type"), {
        target: { value: "Mobile App" },
      });
      expect(mockUpdateProject).toHaveBeenCalledWith({ appType: "Mobile App" });
    });

    it("calls updateProject with the audience patch when the Audience input changes", () => {
      renderWizard({ ...DEFAULT_STATE, step: 1 });
      fireEvent.change(screen.getByPlaceholderText("Audience"), {
        target: { value: "Enterprises" },
      });
      expect(mockUpdateProject).toHaveBeenCalledWith({ audience: "Enterprises" });
    });

    it("calls updateProject with the goal patch when the Goal input changes", () => {
      renderWizard({ ...DEFAULT_STATE, step: 1 });
      fireEvent.change(screen.getByPlaceholderText("Goal"), {
        target: { value: "Grow revenue" },
      });
      expect(mockUpdateProject).toHaveBeenCalledWith({ goal: "Grow revenue" });
    });
  });

  describe("step 2 - features", () => {
    it("renders a checkbox for every available feature", () => {
      renderWizard({ ...DEFAULT_STATE, step: 2 });
      ["dark-mode", "notifications", "analytics"].forEach((feature) => {
        expect(screen.getByLabelText(feature)).toBeInTheDocument();
      });
    });

    it("checks only the boxes for features present in state", () => {
      renderWizard({ ...DEFAULT_STATE, step: 2, features: ["notifications"] });
      expect(screen.getByLabelText("dark-mode")).not.toBeChecked();
      expect(screen.getByLabelText("notifications")).toBeChecked();
      expect(screen.getByLabelText("analytics")).not.toBeChecked();
    });

    it("calls toggleFeature with the feature id when a checkbox is clicked", () => {
      renderWizard({ ...DEFAULT_STATE, step: 2 });
      fireEvent.click(screen.getByLabelText("analytics"));
      expect(mockToggleFeature).toHaveBeenCalledWith("analytics");
    });

    it("does not render other steps' content while on step 2", () => {
      renderWizard({ ...DEFAULT_STATE, step: 2 });
      expect(screen.queryByPlaceholderText("App Type")).not.toBeInTheDocument();
      expect(screen.queryByText(/Welcome!/)).not.toBeInTheDocument();
      expect(screen.queryByText(/All done!/)).not.toBeInTheDocument();
    });
  });

  describe("step 3 - review", () => {
    it("renders a JSON preview of the entire onboarding state", () => {
      const state: OnboardingState = {
        step: 3,
        project: { appType: "SaaS", audience: "Devs", goal: "Grow" },
        features: ["dark-mode"],
      };
      const { container } = renderWizard(state);
      const pre = container.querySelector("pre");
      expect(pre).not.toBeNull();
      expect(pre?.textContent).toBe(JSON.stringify(state, null, 2));
    });
  });

  it("renders the completion message on the final step", () => {
    renderWizard({ ...DEFAULT_STATE, step: 4 });
    expect(screen.getByText(/All done!/)).toBeInTheDocument();
  });

  describe("navigation controls", () => {
    it("calls reset when the Reset button is clicked", () => {
      renderWizard();
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("disables the Back button on the first step", () => {
      renderWizard({ ...DEFAULT_STATE, step: 0 });
      expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    });

    it("enables the Back button when not on the first step", () => {
      renderWizard({ ...DEFAULT_STATE, step: 1 });
      expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    });

    it("calls back when the enabled Back button is clicked", () => {
      renderWizard({ ...DEFAULT_STATE, step: 2 });
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("disables the Next button on the final step", () => {
      renderWizard({ ...DEFAULT_STATE, step: 4 });
      expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    });

    it("enables the Next button when not on the final step", () => {
      renderWizard({ ...DEFAULT_STATE, step: 3 });
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    });

    it("calls next when the enabled Next button is clicked", () => {
      renderWizard({ ...DEFAULT_STATE, step: 0 });
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
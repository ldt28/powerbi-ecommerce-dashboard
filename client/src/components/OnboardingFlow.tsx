import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  completed: boolean;
}

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to EcomAnalytics",
      description: "Let's set up your dashboard in just a few steps",
      icon: "👋",
      action: "Get Started",
      completed: completedSteps.has("welcome"),
    },
    {
      id: "connect-platform",
      title: "Connect Your First Platform",
      description: "Choose Google Analytics, Facebook Ads, or YouTube to start syncing data",
      icon: "🔗",
      action: "Connect Platform",
      completed: completedSteps.has("connect-platform"),
    },
    {
      id: "customize-dashboard",
      title: "Customize Your Dashboard",
      description: "Choose which metrics and charts matter most to your business",
      icon: "⚙️",
      action: "Customize",
      completed: completedSteps.has("customize-dashboard"),
    },
    {
      id: "invite-team",
      title: "Invite Your Team",
      description: "Add team members to collaborate on analytics insights",
      icon: "👥",
      action: "Invite Team",
      completed: completedSteps.has("invite-team"),
    },
    {
      id: "explore-features",
      title: "Explore Advanced Features",
      description: "Learn about reports, alerts, and data export options",
      icon: "✨",
      action: "Learn More",
      completed: completedSteps.has("explore-features"),
    },
  ];

  const handleStepComplete = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(steps[currentStep].id);
    setCompletedSteps(newCompleted);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const progress = (completedSteps.size / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{currentStepData.icon}</div>
            <CardTitle className="text-3xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base mt-2">{currentStepData.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? "bg-blue-50 border border-blue-200"
                      : step.completed
                        ? "bg-green-50"
                        : "bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                          index === currentStep ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? "text-green-700" : "text-gray-700"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleStepComplete} className="flex-1 gap-2">
                {currentStep === steps.length - 1 ? "Complete Onboarding" : "Next"}
                {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>

            {/* Tips Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Zap className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Pro Tip</p>
                  <p className="text-sm text-amber-800 mt-1">
                    You can always access these features later from your settings and help sections.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help? Check out our{" "}
          <a href="/help" className="text-blue-600 hover:underline">
            documentation
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Onboarding Modal - Can be shown to new users
 */
export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <OnboardingFlow
          onComplete={() => {
            onComplete?.();
            onClose();
          }}
          onSkip={onClose}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Check } from 'lucide-react';
import { BasicInformation } from './steps/BasicInformation';
import { FinancialSituation } from './steps/FinancialSituation';
import { RiskAssessment } from './steps/RiskAssessment';
import { GoalsObjectives } from './steps/GoalsObjectives';
import { ReviewGenerate } from './steps/ReviewGenerate';

interface OnboardingFlowProps {
  onComplete: (data: any, documents: any) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    basicInfo: {},
    financial: {},
    risk: {},
    goals: {},
  });

  const steps = [
    { number: 1, title: 'Basic Information', component: BasicInformation },
    { number: 2, title: 'Financial Situation', component: FinancialSituation },
    { number: 3, title: 'Risk Assessment', component: RiskAssessment },
    { number: 4, title: 'Goals & Objectives', component: GoalsObjectives },
    { number: 5, title: 'Review & Generate', component: ReviewGenerate },
  ];

  const handleStepComplete = (stepData: any) => {
    const stepKeys = ['basicInfo', 'financial', 'risk', 'goals'];
    const updatedData = {
      ...formData,
      [stepKeys[currentStep - 1]]: stepData,
    };
    setFormData(updatedData);

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="mb-2">RIA Client Onboarding</h1>
          <p className="text-muted-foreground">
            Intelligent onboarding system powered by AI
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.number
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.number
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm ${
                        currentStep >= step.number
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition-all ${
                      currentStep > step.number ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <CurrentStepComponent
          data={formData}
          onNext={handleStepComplete}
          onBack={handleBack}
          onComplete={onComplete}
          currentStep={currentStep}
        />
      </div>
    </div>
  );
}

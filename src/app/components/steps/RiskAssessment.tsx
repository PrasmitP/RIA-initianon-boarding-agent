import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface RiskAssessmentProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const questions = [
  {
    id: 'marketDecline',
    question: 'If your portfolio declined by 20% in a short period, what would you do?',
    options: [
      { value: 'sell', label: 'Sell everything to avoid further losses', score: 1 },
      { value: 'sellSome', label: 'Sell some investments', score: 2 },
      { value: 'hold', label: 'Hold and wait for recovery', score: 3 },
      { value: 'buy', label: 'Buy more at lower prices', score: 4 },
    ],
  },
  {
    id: 'investmentGoal',
    question: 'What is your primary investment goal?',
    options: [
      { value: 'preservation', label: 'Capital preservation', score: 1 },
      { value: 'income', label: 'Generate steady income', score: 2 },
      { value: 'balanced', label: 'Balanced growth and income', score: 3 },
      { value: 'aggressive', label: 'Aggressive growth', score: 4 },
    ],
  },
  {
    id: 'timeHorizon',
    question: 'What is your investment time horizon?',
    options: [
      { value: 'short', label: 'Less than 3 years', score: 1 },
      { value: 'medium', label: '3-7 years', score: 2 },
      { value: 'long', label: '7-15 years', score: 3 },
      { value: 'veryLong', label: 'More than 15 years', score: 4 },
    ],
  },
  {
    id: 'riskTolerance',
    question: 'How would you describe your risk tolerance?',
    options: [
      { value: 'conservative', label: 'Conservative - I prefer stable, predictable returns', score: 1 },
      { value: 'moderate', label: 'Moderate - I can accept some volatility', score: 2 },
      { value: 'growth', label: 'Growth-oriented - I can handle significant volatility', score: 3 },
      { value: 'aggressive', label: 'Aggressive - I seek maximum returns despite high risk', score: 4 },
    ],
  },
];

export function RiskAssessment({ data, onNext, onBack }: RiskAssessmentProps) {
  const [formData, setFormData] = useState(data.risk || {
    marketDecline: '',
    investmentGoal: '',
    timeHorizon: '',
    riskTolerance: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scores = questions.map((q) => {
      const answer = formData[q.id];
      const option = q.options.find((o) => o.value === answer);
      return option?.score || 0;
    });

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const avgScore = totalScore / questions.length;

    let riskProfile = 'Conservative';
    if (avgScore >= 3.5) riskProfile = 'Aggressive';
    else if (avgScore >= 2.5) riskProfile = 'Growth';
    else if (avgScore >= 1.5) riskProfile = 'Moderate';

    onNext({ ...formData, riskProfile, riskScore: avgScore });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isValid = questions.every((q) => formData[q.id]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h2 className="mb-2">Risk Assessment</h2>
        <p className="text-muted-foreground mb-8">
          Answer these questions to help us understand your risk tolerance and investment preferences.
        </p>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="pb-8 border-b border-border last:border-0 last:pb-0">
              <div className="mb-4">
                <span className="inline-block px-2.5 py-1 bg-muted text-muted-foreground rounded text-sm mb-3">
                  Question {index + 1} of {questions.length}
                </span>
                <h4 className="text-foreground">{question.question}</h4>
              </div>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      formData[question.id] === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-input-background hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={formData[question.id] === option.value}
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      className="mt-0.5"
                    />
                    <span className="flex-1">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

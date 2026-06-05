import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';

interface Goal {
  id: string;
  description: string;
  targetAmount: string;
  timeframe: string;
  priority: string;
}

interface GoalsObjectivesProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function GoalsObjectives({ data, onNext, onBack }: GoalsObjectivesProps) {
  const [goals, setGoals] = useState<Goal[]>(
    data.goals?.goals || [
      {
        id: '1',
        description: '',
        targetAmount: '',
        timeframe: '',
        priority: '',
      },
    ]
  );

  const [retirementAge, setRetirementAge] = useState(data.goals?.retirementAge || '');
  const [retirementIncome, setRetirementIncome] = useState(data.goals?.retirementIncome || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      goals: goals.filter((g) => g.description),
      retirementAge,
      retirementIncome,
    });
  };

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        description: '',
        targetAmount: '',
        timeframe: '',
        priority: '',
      },
    ]);
  };

  const removeGoal = (id: string) => {
    if (goals.length > 1) {
      setGoals(goals.filter((g) => g.id !== id));
    }
  };

  const updateGoal = (id: string, field: keyof Goal, value: string) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const hasValidGoal = goals.some((g) => g.description && g.targetAmount);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h2 className="mb-6">Goals & Objectives</h2>

        <div className="space-y-8">
          <div className="pb-8 border-b border-border">
            <h3 className="mb-4">Retirement Planning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="retirementAge" className="block mb-2 text-foreground">
                  Target Retirement Age
                </label>
                <input
                  id="retirementAge"
                  type="number"
                  min="50"
                  max="100"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="65"
                />
              </div>

              <div>
                <label htmlFor="retirementIncome" className="block mb-2 text-foreground">
                  Desired Annual Retirement Income
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    id="retirementIncome"
                    type="number"
                    min="0"
                    value={retirementIncome}
                    onChange={(e) => setRetirementIncome(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="80000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3>Financial Goals</h3>
              <button
                type="button"
                onClick={addGoal}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </div>

            <div className="space-y-6">
              {goals.map((goal, index) => (
                <div
                  key={goal.id}
                  className="p-6 bg-input-background rounded-lg border border-border relative"
                >
                  {goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground">Goal {index + 1}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-foreground">Goal Description</label>
                      <input
                        type="text"
                        value={goal.description}
                        onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g., Buy a vacation home, fund children's education..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-2 text-foreground">Target Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={goal.targetAmount}
                            onChange={(e) => updateGoal(goal.id, 'targetAmount', e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="50000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-foreground">Timeframe</label>
                        <select
                          value={goal.timeframe}
                          onChange={(e) => updateGoal(goal.id, 'timeframe', e.target.value)}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select timeframe</option>
                          <option value="1-3">1-3 years</option>
                          <option value="3-5">3-5 years</option>
                          <option value="5-10">5-10 years</option>
                          <option value="10+">10+ years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-foreground">Priority</label>
                        <select
                          value={goal.priority}
                          onChange={(e) => updateGoal(goal.id, 'priority', e.target.value)}
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select priority</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          disabled={!hasValidGoal}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

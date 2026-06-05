import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { formatThousands, toRawDigits } from '../../lib/money';

interface FinancialSituationProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

/**
 * Step 2 — the client's financial picture (income, assets, liabilities,
 * experience). Same controlled-form pattern as the other steps: seed from
 * `data.financial`, edit locally, push up on submit.
 */
export function FinancialSituation({ data, onNext, onBack }: FinancialSituationProps) {
  // Merge defaults so every field is a defined string (the parent seeds
  // `financial` as a truthy `{}`, which a bare `||` fallback would not replace).
  const [formData, setFormData] = useState({
    annualIncome: '',
    totalAssets: '',
    liquidAssets: '',
    liabilities: '',
    investmentExperience: '',
    currentInvestments: '',
    ...data.financial,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Income and total assets are the minimum needed to draft documents.
  const isValid = formData.annualIncome && formData.totalAssets;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h2 className="mb-6">Financial Situation</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="annualIncome" className="block mb-2 text-foreground">
                Annual Income *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  id="annualIncome"
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatThousands(formData.annualIncome)}
                  onChange={(e) => handleChange('annualIncome', toRawDigits(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="150,000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="totalAssets" className="block mb-2 text-foreground">
                Total Assets *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  id="totalAssets"
                  type="text"
                  inputMode="numeric"
                  required
                  value={formatThousands(formData.totalAssets)}
                  onChange={(e) => handleChange('totalAssets', toRawDigits(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="500,000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="liquidAssets" className="block mb-2 text-foreground">
                Liquid Assets
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  id="liquidAssets"
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(formData.liquidAssets)}
                  onChange={(e) => handleChange('liquidAssets', toRawDigits(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="100,000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="liabilities" className="block mb-2 text-foreground">
                Total Liabilities
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  id="liabilities"
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(formData.liabilities)}
                  onChange={(e) => handleChange('liabilities', toRawDigits(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="200,000"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="investmentExperience" className="block mb-2 text-foreground">
              Investment Experience
            </label>
            <select
              id="investmentExperience"
              value={formData.investmentExperience}
              onChange={(e) => handleChange('investmentExperience', e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select experience level</option>
              <option value="none">No Experience</option>
              <option value="limited">Limited (1-3 years)</option>
              <option value="moderate">Moderate (3-10 years)</option>
              <option value="extensive">Extensive (10+ years)</option>
            </select>
          </div>

          <div>
            <label htmlFor="currentInvestments" className="block mb-2 text-foreground">
              Current Investment Holdings
            </label>
            <textarea
              id="currentInvestments"
              value={formData.currentInvestments}
              onChange={(e) => handleChange('currentInvestments', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="e.g., 401k, IRA, stocks, bonds, real estate..."
            />
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

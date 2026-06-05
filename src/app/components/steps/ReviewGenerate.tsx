import { useState } from 'react';
import { ArrowLeft, FileText, Sparkles, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface ReviewGenerateProps {
  data: any;
  onBack: () => void;
  onComplete: (data: any, documents: any) => void;
}

export function ReviewGenerate({ data, onBack, onComplete }: ReviewGenerateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45e67790/generate-documents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate documents');
      }

      const documents = await response.json();
      setIsGenerating(false);
      onComplete(data, documents);
    } catch (err) {
      console.error('Error generating documents:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating documents');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h2 className="mb-6">Review Your Information</h2>

        <div className="space-y-6">
          <div className="pb-6 border-b border-border">
            <h3 className="mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2">{data.basicInfo.clientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>
                <span className="ml-2">{data.basicInfo.age}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2">{data.basicInfo.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Employment:</span>
                <span className="ml-2">{data.basicInfo.employmentStatus || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-border">
            <h3 className="mb-4">Financial Situation</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Annual Income:</span>
                <span className="ml-2">${parseInt(data.financial.annualIncome).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Assets:</span>
                <span className="ml-2">${parseInt(data.financial.totalAssets).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Investment Experience:</span>
                <span className="ml-2">{data.financial.investmentExperience || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-border">
            <h3 className="mb-4">Risk Profile</h3>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg">
                {data.risk.riskProfile}
              </div>
              <span className="text-sm text-muted-foreground">
                Score: {data.risk.riskScore?.toFixed(2)} / 4.0
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-4">Goals</h3>
            <div className="space-y-3">
              {data.goals.retirementAge && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Retirement Goal:</span>
                  <span className="ml-2">
                    Age {data.goals.retirementAge}
                    {data.goals.retirementIncome && ` with $${parseInt(data.goals.retirementIncome).toLocaleString()}/year income`}
                  </span>
                </div>
              )}
              {data.goals.goals?.map((goal: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="text-muted-foreground">Goal {index + 1}:</span>
                  <span className="ml-2">
                    {goal.description}
                    {goal.targetAmount && ` ($${parseInt(goal.targetAmount).toLocaleString()})`}
                    {goal.timeframe && ` - ${goal.timeframe} years`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2">AI-Powered Document Generation</h3>
            <p className="text-muted-foreground text-sm">
              Generate comprehensive onboarding documents using advanced AI analysis. The system will create:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { title: 'Client Risk Profile', desc: 'Detailed risk assessment and tolerance analysis' },
            { title: 'Goals Brief', desc: 'Comprehensive summary of financial objectives' },
            { title: 'Planning Agenda', desc: 'Structured meeting agenda for client discussion' },
            { title: 'Draft IPS', desc: 'Investment Policy Statement framework' },
          ].map((doc, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-sm">{doc.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{doc.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Documents with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Documents
            </>
          )}
        </button>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}

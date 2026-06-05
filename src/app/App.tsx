import { useState } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ResultsView } from './components/ResultsView';

export default function App() {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [generatedDocuments, setGeneratedDocuments] = useState<any>(null);

  const handleComplete = (data: any, documents: any) => {
    setFormData(data);
    setGeneratedDocuments(documents);
    setShowResults(true);
  };

  const handleStartOver = () => {
    setShowResults(false);
    setFormData(null);
    setGeneratedDocuments(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {!showResults ? (
        <OnboardingFlow onComplete={handleComplete} />
      ) : (
        <ResultsView documents={generatedDocuments} onStartOver={handleStartOver} />
      )}
    </div>
  );
}

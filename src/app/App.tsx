import { useState } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ResultsView } from './components/ResultsView';

/**
 * Root component — a two-screen state machine.
 *
 * The app has exactly two views and no router: the intake wizard
 * (`OnboardingFlow`) and the generated-document viewer (`ResultsView`).
 * `showResults` decides which one is on screen. All session state lives here in
 * memory (there is no persistence yet), so a refresh starts over.
 */
export default function App() {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<any>(null);          // the collected intake answers
  const [generatedDocuments, setGeneratedDocuments] = useState<any>(null); // the 4 AI-generated docs

  // Called when the wizard finishes generating documents → switch to the viewer.
  const handleComplete = (data: any, documents: any) => {
    setFormData(data);
    setGeneratedDocuments(documents);
    setShowResults(true);
  };

  // "New Client" — clear everything and return to step 1 of the wizard.
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

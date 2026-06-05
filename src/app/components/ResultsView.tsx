import { useState } from 'react';
import { FileText, Download, RotateCcw, CheckCircle } from 'lucide-react';

interface ResultsViewProps {
  documents: {
    riskProfile: string;
    goalsBrief: string;
    planningAgenda: string;
    draftIPS: string;
  };
  onStartOver: () => void;
}

export function ResultsView({ documents, onStartOver }: ResultsViewProps) {
  const [selectedDoc, setSelectedDoc] = useState<keyof typeof documents>('riskProfile');

  const docList = [
    { key: 'riskProfile', title: 'Client Risk Profile', icon: FileText },
    { key: 'goalsBrief', title: 'Goals Brief', icon: FileText },
    { key: 'planningAgenda', title: 'Planning Agenda', icon: FileText },
    { key: 'draftIPS', title: 'Draft IPS', icon: FileText },
  ] as const;

  const handleDownload = (docKey: keyof typeof documents, title: string) => {
    const content = documents[docKey];
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-foreground/20 rounded-full">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="mb-2">Documents Generated Successfully</h1>
              <p className="opacity-90">
                All onboarding documents have been created and are ready for review
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-6">
              <h3 className="mb-4">Generated Documents</h3>
              <div className="space-y-2">
                {docList.map((doc) => (
                  <button
                    key={doc.key}
                    onClick={() => setSelectedDoc(doc.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      selectedDoc === doc.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-input-background hover:bg-muted'
                    }`}
                  >
                    <doc.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{doc.title}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <button
                  onClick={() => {
                    docList.forEach((doc) => {
                      handleDownload(doc.key, doc.title);
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>

                <button
                  onClick={onStartOver}
                  className="w-full px-4 py-2.5 bg-input-background text-foreground rounded-lg hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Client
                </button>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2>{docList.find((d) => d.key === selectedDoc)?.title}</h2>
                <button
                  onClick={() =>
                    handleDownload(
                      selectedDoc,
                      docList.find((d) => d.key === selectedDoc)?.title || ''
                    )
                  }
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {documents[selectedDoc]}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

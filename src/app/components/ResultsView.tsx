import { useState } from 'react';
import { FileText, Download, RotateCcw, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadMarkdownAsPdf } from '../lib/markdownToPdf';

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
    downloadMarkdownAsPdf(documents[docKey], title);
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
                <div className="max-w-none text-sm leading-relaxed text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-semibold mt-6 mb-4 first:mt-0">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-6 mb-3 pb-2 border-b border-border">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-base font-semibold mt-4 mb-2">{children}</h4>
                      ),
                      p: ({ children }) => <p className="mb-4">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
                      ),
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => <em className="italic">{children}</em>,
                      hr: () => <hr className="my-6 border-border" />,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} className="text-primary underline" target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                      th: ({ children }) => (
                        <th className="border border-border px-3 py-2 text-left font-semibold">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border px-3 py-2 align-top">{children}</td>
                      ),
                    }}
                  >
                    {documents[selectedDoc]}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

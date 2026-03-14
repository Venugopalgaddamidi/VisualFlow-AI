import React, { useState } from 'react';
import MermaidRenderer from '../components/MermaidRenderer';
import { Sparkles, RefreshCw, AlertCircle, Wand2, Settings2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DIAGRAM_LABELS = {
  flowchart: 'Flowchart',
  mindmap: 'Mind Map',
  sequence: 'Sequence Diagram',
  state: 'State Diagram',
  'entity-relationship': 'Entity Relationship (ER)',
};

const DIAGRAM_ICONS = {
  flowchart: '⬡',
  mindmap: '✦',
  sequence: '⇄',
  state: '◎',
  'entity-relationship': '⊡',
};

const GeneratorPage = () => {
  const [inputText, setInputText] = useState('');
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [manualType, setManualType] = useState('flowchart');
  const [chartCode, setChartCode] = useState('');
  const [detectedType, setDetectedType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to generate a diagram.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setDetectedType('');

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          diagramType: isAutoMode ? 'auto' : manualType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate diagram');
      }

      const data = await response.json();
      setChartCode(data.mermaidCode);
      if (data.detectedType) setDetectedType(data.detectedType);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Input Panel */}
        <div className="w-full md:w-1/3 flex flex-col gap-5 h-[50vh] md:h-full">
          <div className="glass-panel p-6 flex-grow flex flex-col transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary-500/20 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">Generate Diagram</h2>
            </div>
            
            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="mb-5 flex-grow flex flex-col group">
              <label htmlFor="inputText" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                Describe your process or idea
              </label>
              <textarea
                id="inputText"
                className="w-full flex-grow p-4 glass-input resize-none text-base"
                placeholder={"Enter a topic or process to generate a diagram...\n\nE.g., A user logs in. If successful, they go to the dashboard. If not, they see an error message and try again."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            {/* Diagram Type Mode Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Diagram Type</label>
                <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    isAutoMode
                      ? 'bg-primary-500/10 border-primary-400/30 text-primary-600 dark:text-primary-400'
                      : 'bg-slate-500/10 border-slate-400/30 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isAutoMode ? (
                    <><Wand2 className="w-3.5 h-3.5" /> Auto</>
                  ) : (
                    <><Settings2 className="w-3.5 h-3.5" /> Manual</>
                  )}
                </button>
              </div>

              {isAutoMode ? (
                <div className="flex items-center gap-3 p-3.5 glass-input rounded-xl">
                  <Wand2 className="h-4 w-4 text-primary-500 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    AI will automatically choose the best diagram type
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="diagramType"
                    className="w-full p-3.5 glass-input appearance-none font-medium text-sm [&>option]:bg-white dark:[&>option]:bg-slate-800 [&>option]:text-slate-800 dark:[&>option]:text-slate-100"
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                  >
                    <option value="flowchart">Flowchart</option>
                    <option value="mindmap">Mind Map</option>
                    <option value="sequence">Sequence Diagram</option>
                    <option value="state">State Diagram</option>
                    <option value="entity-relationship">Entity Relationship (ER)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              )}

              {/* Detected type badge */}
              {detectedType && isAutoMode && !isGenerating && (
                <div className="mt-2.5 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <span className="text-xs text-slate-500 dark:text-slate-400">AI selected:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 border border-primary-400/30 text-primary-600 dark:text-primary-400">
                    {DIAGRAM_ICONS[detectedType]} {DIAGRAM_LABELS[detectedType] || detectedType}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center px-6 py-4 font-semibold ${
                isGenerating 
                  ? 'bg-primary-500/50 cursor-not-allowed text-white/50 border border-transparent rounded-xl' 
                  : 'glass-button'
              }`}
            >
              {isGenerating ? (
                 <>
                  <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {isAutoMode ? 'Analyzing & Generating...' : 'Generating Magic...'}
                 </>
              ) : (
                <>
                  <Sparkles className="-ml-1 mr-2 h-5 w-5" />
                  Generate Diagram
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-full md:w-2/3 h-[50vh] md:h-full pb-6 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="glass-panel overflow-hidden min-h-full shrink-0 flex flex-col">
            <MermaidRenderer chartCode={chartCode} isGenerating={isGenerating} onRegenerate={handleGenerate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorPage;

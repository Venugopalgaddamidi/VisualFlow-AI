import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Share2, ZoomIn, Braces, ArrowRight, Sparkles, FileText, ScanSearch, Download, ToggleLeft } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-transparent min-h-[calc(100vh-4rem)] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-primary-300/30 dark:bg-primary-500/10 blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-20 sm:top-40 left-0 -ml-10 sm:-ml-20 w-40 h-40 sm:w-72 sm:h-72 rounded-full bg-accent-300/30 dark:bg-accent-500/10 blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-6 sm:pb-10 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border-primary-500/20 text-primary-600 dark:text-primary-400 font-medium text-xs sm:text-sm mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 dark:bg-primary-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500 dark:bg-primary-400"></span>
            </span>
            New: Generative AI Diagrams
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight font-extrabold text-slate-900 dark:text-white mb-4 sm:mb-6">
            <span className="block mb-2">Transform Text into</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-400 pb-2">
              Visual Diagrams Instantly
            </span>
          </h1>
          
          <p className="mt-3 max-w-sm sm:max-w-md mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 sm:mt-5 md:max-w-3xl leading-relaxed px-2">
            Use the power of Generative AI to automatically convert your topics, paragraphs, or step-by-step explanations into professional flowcharts, mind maps, and system diagrams.
          </p>
          
          <div className="mt-8 sm:mt-10 max-w-sm mx-auto sm:max-w-none flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
            <Link
              to="/generate"
              className="group flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 glass-button text-sm sm:text-base font-semibold md:text-lg shadow-lg hover:shadow-primary-500/25 transition-all duration-300 active:scale-[0.98]"
            >
              <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
              Start Generating Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-6 sm:py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
            <h2 className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 font-bold tracking-widest uppercase mb-2 sm:mb-3">Features</h2>
            <p className="text-2xl sm:text-3xl md:text-4xl leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white">
              Everything you need to visualize ideas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard 
              icon={<Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />}
              title="AI‑Powered Generation"
              description="Paste any idea, process, or description and watch the AI instantly transform it into a clean, professional diagram in seconds."
            />
            <FeatureCard 
              icon={<Braces className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />}
              title="5 Diagram Types"
              description="Generate Flowcharts, Mind Maps, Sequence Diagrams, State Diagrams, and Entity-Relationship (ER) diagrams — all with strict Mermaid syntax."
            />
            <FeatureCard 
              icon={<ToggleLeft className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />}
              title="Auto‑Detect or Manual"
              description="Let the AI automatically choose the best diagram type for your content, or switch to manual mode and pick the type yourself."
            />
            <FeatureCard 
              icon={<ZoomIn className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />}
              title="Interactive Canvas"
              description="Zoom, pan, and reposition your diagram on a smooth canvas. Works seamlessly in both dark and light mode for comfortable reading."
            />
            <FeatureCard 
              icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />}
              title="AI Diagram Summary"
              description="Every generated diagram comes with an AI-written plain-English summary explaining exactly what the diagram represents."
            />
            <FeatureCard 
              icon={<Download className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />}
              title="One‑Click JPG Export"
              description="Export your diagram as a crisp, high-resolution JPG image — perfect for slides, documentation, reports, or sharing with your team."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-panel p-4 sm:p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/10 dark:bg-primary-500/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary-500/20 dark:group-hover:bg-primary-500/30 transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">{title}</h3>
    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;

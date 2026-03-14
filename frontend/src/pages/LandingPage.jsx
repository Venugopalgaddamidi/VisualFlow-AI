import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Share2, ZoomIn, Braces, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-transparent min-h-[calc(100vh-4rem)] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-300/30 dark:bg-primary-500/10 blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-40 left-0 -ml-20 w-72 h-72 rounded-full bg-accent-300/30 dark:bg-accent-500/10 blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border-primary-500/20 text-primary-600 dark:text-primary-400 font-medium text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 dark:bg-primary-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500 dark:bg-primary-400"></span>
            </span>
            New: Generative AI Diagrams
          </div>
          
          <h1 className="text-5xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-6xl md:text-7xl mb-6">
            <span className="block mb-2">Transform Text into</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-400 pb-2">
              Visual Diagrams Instantly
            </span>
          </h1>
          
          <p className="mt-3 max-w-md mx-auto text-base text-slate-600 dark:text-slate-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl leading-relaxed">
            Use the power of Generative AI to automatically convert your topics, paragraphs, or step-by-step explanations into professional flowcharts, mind maps, and system diagrams.
          </p>
          
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/generate"
              className="group flex items-center justify-center px-8 py-4 glass-button text-base font-semibold md:text-lg shadow-lg hover:shadow-primary-500/25 transition-all duration-300 active:scale-[0.98]"
            >
              <Wand2 className="mr-2 h-5 w-5" /> 
              Start Generating Free
              <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm text-primary-600 dark:text-primary-400 font-bold tracking-widest uppercase mb-3">Features</h2>
            <p className="text-3xl leading-tight font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to visualize ideas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Wand2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
              title="AI‑generated diagrams"
              description="Paste any idea or process, and the AI turns it into a clean, ready‑to‑use diagram in seconds."
            />
            <FeatureCard 
              icon={<Braces className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
              title="Multiple diagram types"
              description="Auto‑detects or manually selects flowcharts, mind maps, sequence, state, and ER diagrams with strict Mermaid syntax."
            />
            <FeatureCard 
              icon={<ZoomIn className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
              title="Interactive canvas"
              description="Zoom, pan, and reposition your diagram on a smooth dark or light canvas that is optimized for reading."
            />
            <FeatureCard 
              icon={<Share2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
              title="One‑click PNG export"
              description="Capture exactly what you see in the viewer as a high‑resolution PNG image for slides, docs, or sharing."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-panel p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
    <div className="w-14 h-14 bg-primary-500/10 dark:bg-primary-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-500/20 dark:group-hover:bg-primary-500/30 transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize, Download, Code, Image as ImageIcon, RefreshCw, Layers } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

const MermaidRenderer = ({ chartCode, isGenerating, onRegenerate }) => {
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const transformComponentRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (!chartCode) {
        setSvgContent('');
        return;
      }
      
      try {
        setError('');
        // Create truly unique ID for the diagram to prevent React StrictMode collision
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        // Remove containerRef from render to let Mermaid use the document body for measurements
        const cleanCode = chartCode.replace(/\r/g, ''); 
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: isDark ? {
            darkMode: true,
            fontFamily: "Inter, sans-serif",
        
            // Canvas
            background: "#020617",
        
            // Node styling
            primaryColor: "#6366f1",
            nodeBkg: "#6366f1",
            primaryBorderColor: "#c7d2fe",
            nodeBorder: "#c7d2fe",
        
            // Text
            primaryTextColor: "#ffffff",
            textColor: "#f1f5f9",
            titleColor: "#e0e7ff",
        
            // Connections
            lineColor: "#e0e7ff",
            edgeLabelBackground: "#020617",
        
            // Clusters
            clusterBkg: "#1e293b",
            clusterBorder: "#94a3b8",
        
            // Secondary nodes
            secondaryColor: "#4f46e5",
            tertiaryColor: "#818cf8",
        
            secondaryTextColor: "#f1f5f9",
            secondaryBorderColor: "#c7d2fe",

            // Mindmap specific
            noteBkgColor: "#26344b",
            noteBorderColor: "#94a3b8",
            noteTextColor: "#f1f5f9",
            cScale0: "#6366f1",
            cScale1: "#818cf8",
            cScale2: "#a5b4fc",
            cScale3: "#bfdbfe",
            primaryBkgColor: "#6366f1",
            primaryTextColor: "#ffffff",
            secondaryBkgColor: "#818cf8",
            secondaryTextColor: "#ffffff",
            tertiaryBkgColor: "#a5b4fc",
            tertiaryTextColor: "#1e293b",
            nodeBkg: "#6366f1",
            nodeBorder: "#4f46e5",
            nodeTextColor: "#ffffff",
          } : {
            darkMode: false,
            fontFamily: "Inter, sans-serif",
        
            background: "#ffffff",
            primaryColor: "#ffffff",
            primaryBorderColor: "#cbd5e1",
            primaryTextColor: "#0f172a",
            lineColor: "#64748b",
            textColor: "#0f172a",
            nodeBkg: "#ffffff",
            nodeBorder: "#cbd5e1",
            clusterBkg: "#f1f5f9",
            clusterBorder: "#e2e8f0",
            titleColor: "#0f172a",
            edgeLabelBackground: "#ffffff",
          },
        
          securityLevel: "loose"
        });

        const { svg } = await mermaid.render(id, cleanCode);
        
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error('Mermaid rendering failed', err);
        if (isMounted) {
          // Show the actual error message so it's debuggable
          setError(err.message || 'Failed to render diagram. The AI might have produced invalid syntax.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chartCode, isDark]);

  const exportPNG = () => {
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Ensure background matches current theme so dark mode text is legible
        const bgColor = isDark ? '#0f172a' : '#ffffff';
        htmlToImage.toPng(svgElement, { backgroundColor: bgColor })
          .then((dataUrl) => {
            download(dataUrl, 'diagram.png');
          })
          .catch((err) => {
            console.error('Failed to export PNG', err);
          });
      }
    }
  };

  const exportSVG = () => {
    if (svgContent) {
      // Inject background-color into the SVG string so it remains visible in standalone image viewers
      const bgColor = isDark ? '#0f172a' : '#ffffff';
      const styledSvg = svgContent.replace('<svg ', `<svg style="background-color: ${bgColor};" `);
      
      const blob = new Blob([styledSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const exportMermaid = () => {
    if (chartCode) {
      const blob = new Blob([chartCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.mmd';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (isGenerating) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent min-h-[300px] sm:min-h-[600px] animate-in fade-in duration-500 px-4">
        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 dark:border-primary-400 animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-b-2 border-accent-500 animate-spin-slow"></div>
          <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 dark:text-primary-400 animate-pulse" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg tracking-tight animate-pulse">Crafting your diagram...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/10 min-h-[300px] sm:min-h-[600px] p-4 sm:p-8 text-center animate-in fade-in duration-300">
        <div className="bg-red-500/20 p-2 sm:p-3 rounded-full mb-3 sm:mb-4">
          <Code className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-700 dark:text-red-400 font-bold mb-1 sm:mb-2 text-base sm:text-lg">Rendering Error</p>
        <p className="text-red-600/80 dark:text-red-400/80 text-xs sm:text-sm max-w-md mb-4 sm:mb-6">{error}</p>
        <div className="p-3 sm:p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-red-500/20 w-full max-w-2xl text-left overflow-auto text-xs text-slate-800 dark:text-slate-300 font-mono whitespace-pre-wrap shadow-sm">
          {chartCode}
        </div>
      </div>
    );
  }

  if (!chartCode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent min-h-[300px] sm:min-h-[600px] px-4">
        <div className="bg-slate-500/10 p-3 sm:p-5 rounded-3xl mb-3 sm:mb-6">
          <Layers className="h-8 w-8 sm:h-12 sm:w-12 text-slate-500/50 dark:text-slate-400/50" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg sm:text-xl mb-1 sm:mb-2 tracking-tight">Ready to map your mind</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-[250px] text-center">Describe your idea on the left and click Generate Diagram</p>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-transparent overflow-hidden flex flex-col h-full min-h-[300px] sm:min-h-[600px] animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        minScale={0.1}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-2 sm:top-5 right-2 sm:right-5 z-10 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm border border-white/40 dark:border-slate-700/50 rounded-xl p-1 sm:p-1.5 flex gap-0.5 sm:gap-1 items-center flex-wrap justify-end sm:justify-start">
                {onRegenerate && (
                  <button onClick={onRegenerate} className="p-2 sm:p-2.5 hover:bg-primary-500/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm group" title="Regenerate">
                    <RefreshCw size={14} className="sm:size-4 group-active:rotate-180 transition-transform duration-300" />
                    <span className="hidden lg:inline-block">Regenerate</span>
                  </button>
                )}
                <div className="w-px h-4 bg-slate-400/30 mx-0.5 sm:mx-1 hidden sm:block"></div>
                <button onClick={() => zoomIn()} className="p-2 sm:p-2.5 hover:bg-slate-500/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors" title="Zoom In">
                  <ZoomIn size={14} className="sm:size-[18px]" />
                </button>
                <button onClick={() => zoomOut()} className="p-2 sm:p-2.5 hover:bg-slate-500/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors" title="Zoom Out">
                  <ZoomOut size={14} className="sm:size-[18px]" />
                </button>
                <button onClick={() => resetTransform()} className="p-2 sm:p-2.5 hover:bg-slate-500/10 rounded-lg text-slate-700 dark:text-slate-300 transition-colors" title="Reset View">
                  <Maximize size={14} className="sm:size-[18px]" />
                </button>
              </div>
              
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm border border-white/40 dark:border-slate-700/50 rounded-xl p-1 sm:p-1.5 flex gap-0.5 sm:gap-1">
                <button
                  onClick={exportPNG}
                  className="p-2 sm:p-2.5 px-2 sm:px-4 hover:bg-slate-500/10 rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm transition-colors"
                  title="Export as PNG"
                >
                  <Download size={14} className="sm:size-[18px]" />
                  <span className="hidden lg:inline-block">Export PNG</span>
                </button>
              </div>
            </div>

            <div className="flex-grow w-full h-full bg-grid-slate-900/[0.04] dark:bg-grid-white/[0.02] bg-[size:20px_20px] cursor-move rounded-b-2xl">
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                {/* We render the SVG content directly from state using dangerouslySetInnerHTML */}
                <div 
                  ref={containerRef}
                  className="w-full h-full flex items-center justify-center p-4 sm:p-8 transition-opacity duration-500 delay-100"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MermaidRenderer;

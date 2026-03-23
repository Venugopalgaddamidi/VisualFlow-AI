import { generateMermaidCode, detectDiagramType, generateSummary } from '../services/aiService.js';

export const generateDiagram = async (req, res, next) => {
  try {
    const { text, diagramType } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Auto-detect if not specified or is explicitly 'auto'
    let resolvedType = diagramType && diagramType !== 'auto' ? diagramType : null;
    if (!resolvedType) {
      resolvedType = await detectDiagramType(text);
    }
    
    // Generate diagram code + summary in parallel
    const [mermaidCode, summary] = await Promise.all([
      generateMermaidCode(text, resolvedType),
      generateSummary(text, resolvedType),
    ]);

    // If for some reason the response is completely empty
    if (!mermaidCode || mermaidCode.trim() === '') {
       return res.status(500).json({ error: 'AI generated an empty response. Please try with more descriptive text.' });
    }

    return res.status(200).json({ mermaidCode, detectedType: resolvedType, summary });
  } catch (error) {
    console.error('Error generating diagram:', error);
    
    // Pass error to global error handler
    next(error);
  }
};

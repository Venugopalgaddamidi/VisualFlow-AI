import { generateMermaidCode, detectDiagramType } from '../services/aiService.js';

export const generateDiagram = async (req, res) => {
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
    
    // Call AI Service
    const mermaidCode = await generateMermaidCode(text, resolvedType);

    // If for some reason the response is completely empty
    if (!mermaidCode || mermaidCode.trim() === '') {
       return res.status(500).json({ error: 'AI generated an empty response. Please try with more descriptive text.' });
    }

    return res.status(200).json({ mermaidCode, detectedType: resolvedType });
  } catch (error) {
    console.error('Error generating diagram:', error);
    
    // Return friendly error directly to client
    return res.status(500).json({ 
      error: error.message || 'An error occurred while generating your diagram.' 
    });
  }
};

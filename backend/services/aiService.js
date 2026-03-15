import { generateWithFallback } from '../groq-client/client.js';

const DIAGRAM_TYPES = ['flowchart', 'mindmap', 'sequence', 'state', 'entity-relationship'];

const isMermaidSyntaxValid = (code) => {
  if (!code) return false;

  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // For mindmap, just check basic structure
  if (code.includes('mindmap')) {
    // Should have a root line
    return lines.some(l => /^\+\s+\S/.test(l));
  }

  // Flowchart validation (original logic)
  for (const line of lines) {

    if (!line.includes('-->') && !/\s>\|/.test(line) && !/\s>\s/.test(line)) continue;

    const arrowCount = (line.match(/-->/g) || []).length;
    if (arrowCount > 1) return false;

    if (/\s-\s+\S+/.test(line) && !line.includes('-->')) return false;
  }

  return true;
};

// Normalize mindmap to ensure valid structure
const normalizeMindmap = (code) => {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l && l !== 'mindmap');
  
  if (lines.length === 0) {
    return 'mindmap\n  + Topic\n    ++ Item';
  }

  // Parse node levels
  const nodes = lines.map(line => {
    const match = line.match(/^(\++)\s+(.*)/);
    if (!match) return null;
    return {
      level: match[1].length,
      text: match[2],
      originalLine: line
    };
  }).filter(n => n !== null);

  if (nodes.length === 0) {
    return 'mindmap\n  + Topic\n    ++ Item';
  }

  // Find or create root (level 1)
  let root = nodes.find(n => n.level === 1);
  if (!root) {
    // If no root, use first node as root
    root = { level: 1, text: nodes[0].text };
    nodes.shift();
  }

  // Build output with proper indentation
  // Root: 2 spaces before +
  // Level 2: 4 spaces before ++
  // Level 3: 6 spaces before +++
  // Pattern: 2 + (level - 1) * 2 spaces
  const output = ['mindmap', `  + ${root.text}`];

  // Add all other nodes, adjusting their levels
  for (const node of nodes) {
    if (node === root) continue;
    
    // Ensure minimum level 2 for children of root
    let adjustedLevel = Math.max(2, node.level);
    
    // Calculate proper indentation: 2 spaces + 2 spaces per level increase
    let spaces = 2 + (adjustedLevel - 1) * 2;
    let indentation = ' '.repeat(spaces) + '+'.repeat(adjustedLevel) + ' ';
    
    output.push(indentation + node.text);
  }

  return output.join('\n');
};

export const detectDiagramType = async (text) => {
  const systemPrompt = `You are a diagram type classifier. Given a user's description, return the single most appropriate diagram type from this list:
- flowchart
- mindmap
- sequence
- state
- entity-relationship

Reply with ONLY one of these exact words:
flowchart
mindmap
sequence
state
entity-relationship`;

  const userPrompt = `What diagram type best fits this description?\n"${text}"`;

  try {
    const result = await generateWithFallback(userPrompt, systemPrompt);
    const detected = result.trim().toLowerCase();
    return DIAGRAM_TYPES.includes(detected) ? detected : 'flowchart';
  } catch {
    return 'flowchart';
  }
};

export const generateMermaidCode = async (text, diagramType) => {

  const systemPrompt = `You are an expert software architect and diagram creator that converts natural language into Mermaid.js diagrams.

STRICT RULES:

Return ONLY raw Mermaid code.
No markdown.
No explanations.

Diagram types:

flowchart → start with "flowchart TD"
mindmap → start with "mindmap"
sequence → start with "sequenceDiagram"
state → start with "stateDiagram-v2"
entity-relationship → start with "erDiagram"

FLOWCHART RULES:

1. Only these arrows:
A --> B
A -->|condition| B

2. Never generate:
A > B
A >|label| B
A - B

3. Decision nodes use:
D{Condition}

4. Every connection must be on its own line.

5. Node labels must always be complete on ONE line.
Correct:
D[Student dashboard is displayed]

Incorrect:
D[Student
dashboard]

6. Do not generate multiple connections on one line.

7. If syntax becomes invalid regenerate before finishing.

MINDMAP RULES:

1. EXACTLY ONE root node at the top level (starts with single +)
2. All children use ++ (children of root)
3. Grandchildren use +++ (children of ++)
4. Continue pattern: ++++ for great-grandchildren, etc.
5. NEVER have multiple lines starting with just + alone
6. Each node must be on its own line
7. Node text goes directly after the +++ symbols with a space
Correct:
mindmap
  + Root Topic
    ++ Child 1
      +++ Grandchild 1A
      +++ Grandchild 1B
    ++ Child 2
      +++ Grandchild 2A

8. All related items must fall under one root topic`;

  const userPrompt = `Create a ${diagramType} from this text:

"${text}"

Return only raw Mermaid code.`;

  try {

    let lastSanitized = '';

    for (let attempt = 0; attempt < 3; attempt++) {

      const rawOutput = await generateWithFallback(userPrompt, systemPrompt);

      let sanitizedOutput = rawOutput.trim();

      // Remove markdown blocks
      const mermaidRegex = /```(?:mermaid)?\s*([\s\S]*?)```/;
      const match = sanitizedOutput.match(mermaidRegex);

      if (match && match[1]) {
        sanitizedOutput = match[1];
      } else {
        sanitizedOutput = sanitizedOutput
          .replace(/^```mermaid/i, '')
          .replace(/^```/, '')
          .replace(/```$/, '')
          .trim();
      }

      // Merge broken node labels across lines
      const mergedLines = [];
      let buffer = "";

      for (const line of sanitizedOutput.split("\n")) {

        const trimmed = line.trim();

        if (buffer) {
          buffer += " " + trimmed;

          if (trimmed.includes("]")) {
            mergedLines.push(buffer);
            buffer = "";
          }
        } else if (/\[[^\]]*$/.test(trimmed)) {
          buffer = trimmed;
        } else {
          mergedLines.push(trimmed);
        }
      }

      if (buffer) mergedLines.push(buffer);

      sanitizedOutput = mergedLines.join("\n");

      // Fix mindmap structure if needed - NORMALIZE instead of just validating
      if (diagramType === 'mindmap') {
        sanitizedOutput = normalizeMindmap(sanitizedOutput);
      }

      // Fix arrow mistakes
      const fixedLines = sanitizedOutput
        .split('\n')
        .map((line) => {

          const trimmed = line.trim();

          const gtLabelMatch = trimmed.match(/^(\S+)\s+>\|([^|]+)\|\s+(\S+)/);

          if (gtLabelMatch) {
            const [, from, label, to] = gtLabelMatch;
            return `${from} -->|${label.trim()}| ${to}`;
          }

          const simpleGtMatch = trimmed.match(/^(\S+)\s+>\s+(\S+)/);

          if (simpleGtMatch) {
            const [, from, to] = simpleGtMatch;
            return `${from} --> ${to}`;
          }

          if (/\[[^\]]*$/.test(trimmed)) {
            return `${trimmed}]`;
          }

          return line;
        });

      sanitizedOutput = fixedLines.join('\n').trim();

      // Ensure brackets are closed
      sanitizedOutput = sanitizedOutput.replace(/\[([^\]]*)$/gm, "[$1]");

      lastSanitized = sanitizedOutput;

      if (isMermaidSyntaxValid(sanitizedOutput)) {
        // For mindmap, ensure it's normalized before returning
        if (diagramType === 'mindmap') {
          return normalizeMindmap(sanitizedOutput);
        }
        return sanitizedOutput;
      }

    }

    // Even if validation fails, normalize mindmaps to ensure they render
    if (diagramType === 'mindmap') {
      return normalizeMindmap(lastSanitized);
    }

    return lastSanitized;

  } catch (error) {
    throw error;
  }
};
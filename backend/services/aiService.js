import { generateWithFallback } from '../groq-client/client.js';

const DIAGRAM_TYPES = ['flowchart', 'mindmap', 'sequence', 'state', 'entity-relationship'];

const isMermaidSyntaxValid = (code) => {
  if (!code) return false;

  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines) {

    if (!line.includes('-->') && !/\s>\|/.test(line) && !/\s>\s/.test(line)) continue;

    const arrowCount = (line.match(/-->/g) || []).length;
    if (arrowCount > 1) return false;

    if (/\s-\s+\S+/.test(line) && !line.includes('-->')) return false;
  }

  return true;
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

7. If syntax becomes invalid regenerate before finishing.`;

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
        return sanitizedOutput;
      }

    }

    return lastSanitized;

  } catch (error) {
    throw error;
  }
};
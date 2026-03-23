import { generateWithFallback } from '../groq-client/client.js';

const DIAGRAM_TYPES = ['flowchart', 'mindmap', 'sequence', 'state', 'entity-relationship'];

const isMermaidSyntaxValid = (code) => {
  if (!code) return false;

  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Mindmap — always pass to normalizer instead of blocking here
  if (code.startsWith('mindmap')) return true;

  // State diagram — always pass to normalizer
  if (code.startsWith('stateDiagram')) return true;

  // Sequence diagram — lenient check
  if (code.startsWith('sequenceDiagram')) return true;

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

// Normalize stateDiagram-v2 output — remove invalid flowchart syntax
const normalizeStateDiagram = (code) => {
  const header = 'stateDiagram-v2';

  // Strip markdown fences if still present
  code = code
    .replace(/```(?:mermaid)?/gi, '')
    .replace(/```/g, '')
    .trim();

  const rawLines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const choiceCounter = { n: 0 };
  const output = [];
  let hasHeader = false;

  for (const line of rawLines) {
    // Keep the header
    if (/^stateDiagram(-v2)?$/i.test(line)) {
      if (!hasHeader) { output.push(header); hasHeader = true; }
      continue;
    }

    // Keep valid state diagram lines
    if (
      /^\[\*\]\s*-->/.test(line) ||          // [*] --> X
      /^-->\s*\[\*\]/.test(line) ||          // --> [*]  (rare but safe)
      /^\w+\s*-->\s*\[\*\]/.test(line) ||   // X --> [*]
      /^\w+\s*-->\s*\w+/.test(line) ||      // X --> Y
      /^state\s+/.test(line) ||             // state "..." as X
      /^note\s+(right|left)\s+of/.test(line) // note right of X
    ) {
      output.push(line);
      continue;
    }

    // Convert flowchart D{Label} decision nodes to <<choice>> states
    const decisionMatch = line.match(/^(\w+)\{([^}]+)\}/);
    if (decisionMatch) {
      const [, id, label] = decisionMatch;
      output.push(`state "${label}" as ${id} <<choice>>`);
      continue;
    }

    // Drop invalid keywords (flowchart-only)
    if (/^(flowchart|graph|subgraph|end|classDef|class|style|linkStyle)\b/.test(line)) continue;

    // Drop lines with square-bracket node definitions used in flowcharts: A[Label]
    if (/^\w+\[[^\]]+\](\s*-->)?/.test(line) && !/-->/.test(line)) continue;

    // Keep anything that looks like a valid comment
    if (line.startsWith('%%')) { output.push(line); continue; }

    // Otherwise drop the line (likely invalid flowchart syntax)
  }

  if (!hasHeader) output.unshift(header);

  return output.join('\n');
};

export const detectDiagramType = async (text) => {
  const systemPrompt = `You are a diagram type classifier. Given a user's description, return the single most appropriate diagram type from this list:
- flowchart
- mindmap
- sequence
- state
- entity-relationship

Usage guidance:
- flowchart: step-by-step processes, decision trees, algorithms
- mindmap: topics with subtopics, history, definitions, encyclopedic/educational content, lists of categories
- sequence: interactions between people/systems over time (e.g. login flow, API calls)
- state: lifecycle of an object with states and transitions (e.g. ATM, traffic light, order status)
- entity-relationship: database schemas, relationships between data entities

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

8. All related items must fall under one root topic

STATE DIAGRAM RULES (stateDiagram-v2):

1. Start with exactly: stateDiagram-v2
2. Use [*] for the initial and final states.
3. Simple transition:       StateA --> StateB
4. Labeled transition:      StateA --> StateB : label text
5. Choice (if/else) nodes use <<choice>> like this:
   state "PIN Correct?" as PINCheck <<choice>>
   [*] --> PINCheck
   PINCheck --> StateA : yes
   PINCheck --> StateB : no
6. NEVER use {curly braces} for any nodes.
7. NEVER use D{...} or any flowchart-style syntax.
8. NEVER use subgraph, classDef, style, or any flowchart keyword.
9. State names must be simple identifiers (no spaces). Use alias if needed:
   state "Insert Card" as InsertCard
10. Every line must be one of:
    - stateDiagram-v2
    - [*] --> StateName
    - StateName --> StateName
    - StateName --> StateName : label
    - state "Label" as Name
    - state "Label" as Name <<choice>>
    - note right of StateName : text`;

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

      // Fix state diagram - strip invalid flowchart syntax
      if (diagramType === 'state') {
        sanitizedOutput = normalizeStateDiagram(sanitizedOutput);
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

    // Even if validation fails, normalize to ensure they render
    if (diagramType === 'mindmap') {
      return normalizeMindmap(lastSanitized);
    }
    if (diagramType === 'state') {
      return normalizeStateDiagram(lastSanitized);
    }

    // --- Fallback: simplify input and retry once ---
    // If all attempts produced invalid syntax, ask the AI to first
    // condense/restructure the input into a clean outline, then regenerate.
    try {
      const simplifyPrompt = `The following text is complex. Extract and rewrite it as a concise, structured bullet-point outline (maximum 30 words per point, no paragraphs). Keep all key concepts. Original text:

"${text}"`;

      const simplifySystem = `You are a text summarizer. Your ONLY job is to return a clean, structured bullet-point outline. No preamble. No markdown formatting. Just plain lines starting with a dash (-).`;

      const simplifiedText = await generateWithFallback(simplifyPrompt, simplifySystem);

      const fallbackPrompt = `Create a ${diagramType} diagram from this structured outline:

${simplifiedText}

Return only raw Mermaid code.`;

      const fallbackRaw = await generateWithFallback(fallbackPrompt, systemPrompt);
      let fallbackCode = fallbackRaw.trim();

      // Strip markdown fences
      const fm = fallbackCode.match(/```(?:mermaid)?\s*([\s\S]*?)```/);
      if (fm && fm[1]) fallbackCode = fm[1].trim();
      else fallbackCode = fallbackCode.replace(/^```(?:mermaid)?/i, '').replace(/```$/, '').trim();

      if (diagramType === 'mindmap') return normalizeMindmap(fallbackCode);
      if (diagramType === 'state') return normalizeStateDiagram(fallbackCode);
      return fallbackCode;
    } catch {
      // If even the fallback fails, return whatever we last had
      return lastSanitized;
    }

  } catch (error) {
    throw error;
  }
};
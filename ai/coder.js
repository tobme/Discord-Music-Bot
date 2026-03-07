// ai/coder.js
import { callGemini } from "./utils.js";

function extractJSON(text) {
  if (!text) return null;

  // Strip markdown fenced code block if present
  const mdMatch = text.match(/```(?:\w+)?\s*([\s\S]*?)```/i);
  if (mdMatch) text = mdMatch[1];

  text = text.trim();
  if (!text) return null;

  // Find first JSON opening char
  const idxObj = text.indexOf("{");
  const idxArr = text.indexOf("[");
  let start = -1;
  if (idxObj === -1) start = idxArr;
  else if (idxArr === -1) start = idxObj;
  else start = Math.min(idxObj, idxArr);
  if (start === -1) return null;

  // Scan for matching closing bracket, respecting strings and escapes
  const openToClose = { "{": "}", "[": "]" };
  const openChar = text[start];
  const closeChar = openToClose[openChar];
  const stack = [openChar];
  let inString = false;
  let escape = false;

  for (let i = start + 1; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === inString) {
        inString = false;
      }
      continue;
    } else {
      if (ch === '"' || ch === "'") {
        inString = ch;
        continue;
      }
      if (ch === "{" || ch === "[") {
        stack.push(ch);
      } else if (ch === "}" || ch === "]") {
        const last = stack.pop();
        // basic mismatch tolerance
        if (!last) return text.slice(start, i + 1);
        if ((last === "{" && ch !== "}") || (last === "[" && ch !== "]")) {
          // mismatch — continue but attempt to be tolerant
        }
        if (stack.length === 0) {
          return text.slice(start, i + 1);
        }
      }
    }
  }

  // Fallback: return substring from first brace to last brace of same type
  const lastIdx = text.lastIndexOf(closeChar);
  if (lastIdx !== -1 && lastIdx > start) return text.slice(start, lastIdx + 1);

  return null;
}

function sanitizeJSON(text) {
  if (typeof text !== "string") return text;
  // Remove trailing commas before } or ]
  const noTrailing = text.replace(/,\s*(?=[}\]])/g, "");
  return noTrailing;
}

export async function generateCode(task, filesToRead) {
  const prompt = `
You are a code-generation assistant.
Task: ${task}
Files to read: ${filesToRead.join(", ")}
Return ONLY valid JSON describing { files: [...], tests: [...] } with no surrounding markdown.
`;
  const response = await callGemini(prompt);

  let jsonText = extractJSON(response);
  if (!jsonText) {
    // As a last resort, try to parse the whole response
    jsonText = (response || "").trim();
  }

  // Sanitize common issues (trailing commas)
  jsonText = sanitizeJSON(jsonText);

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    // Try one more time after more aggressive sanitization
    try {
      const cleaned = jsonText.replace(/```(?:\w+)?/g, "").replace(/^[\s\S]*?({|\[)/, "$1");
      const finalText = sanitizeJSON(cleaned);
      return JSON.parse(finalText);
    } catch (err2) {
      console.error("Failed to parse JSON from AI response:\n", jsonText);
      throw err2;
    }
  }
}
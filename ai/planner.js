// ai/planner.js
import { callGemini } from "./utils.js";

export async function planTask(task) {
  const prompt = `
You are a senior software architect.

Project structure:
- cloud/ : backend
- unittest/ : tests
- public/ : frontend
- github/ : CI (protected)

Task:
${task}

Rules:
- Only modify relevant folders
- Do not touch github/
- Return ONLY valid JSON (no markdown, no code blocks) with:
  mode, area, plan, filesToRead, allowedWriteDirs`;

  const response = await callGemini(prompt);
  
  // Extract JSON from markdown code blocks if present
  let jsonText = response.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }
  
  return JSON.parse(jsonText);
}
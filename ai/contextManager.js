import fs from "fs";
import path from "path";

export async function buildContext(filesToRead) {
  const context = {};

  for (const filePath of filesToRead) {
    if (fs.existsSync(filePath)) {
      context[filePath] = fs.readFileSync(filePath, "utf8");
    }
  }

  // Always include package.json
  context["package.json"] = fs.readFileSync("package.json", "utf8");

  return context;
}
import fs from "fs";
import { createPatch } from "diff";

export function showDiff(result) {
  for (const f of result.files || []) {
    const targetPath = f.path || f.file || "<untitled>";
    const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, "utf8") : "";

    let newContent = "";
    if (typeof f.content === "string") {
      newContent = f.content;
    } else if (f.action === "replace" && typeof f.replace === "string") {
      // Prefer search/replace on current file when possible
      if (typeof f.search === "string" && current.includes(f.search)) {
        newContent = current.replace(f.search, f.replace);
      } else {
        // Fallback: treat replace as full new content
        newContent = f.replace;
      }
    } else if ((f.action === "create" || f.action === "add") && typeof f.replace === "string") {
      newContent = f.replace;
    } else {
      // Unknown format — show no change (keeps current)
      newContent = current;
    }

    const changes = createPatch(targetPath, current, newContent);
    console.log(changes);
  }
}
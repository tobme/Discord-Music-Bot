import fs from "fs";
import path from "path";

export function applyChanges(result) {
  for (const file of result.files || []) {
    const targetPath = file.path || file.file;
    if (!targetPath) continue;

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    let content = "";
    if (typeof file.content === "string") {
      content = file.content;
    } else if (file.action === "replace" && typeof file.replace === "string") {
      if (typeof file.search === "string" && fs.existsSync(targetPath)) {
        const current = fs.readFileSync(targetPath, "utf8");
        content = current.includes(file.search) ? current.replace(file.search, file.replace) : file.replace;
      } else {
        content = file.replace;
      }
    } else if ((file.action === "create" || file.action === "add") && typeof file.replace === "string") {
      content = file.replace;
    } else {
      content = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, "utf8") : "";
    }

    fs.writeFileSync(targetPath, content);
  }

  for (const test of result.tests || []) {
    const targetPath = test.path || test.file;
    if (!targetPath) continue;

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    const content = typeof test.content === "string" ? test.content : (test.replace || "");
    fs.writeFileSync(targetPath, content);
  }
}
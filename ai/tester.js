import { execSync } from "child_process";
import fs from "fs";

export async function runTests(result) {
  try {
    // Write to temp folder
    fs.mkdirSync(".temp", { recursive: true });

    for (const file of result.files) {
      fs.writeFileSync(`.temp/${file.path}`, file.content);
    }

    for (const test of result.tests) {
      fs.writeFileSync(`.temp/${test.path}`, test.content);
    }

    execSync("npx jest .temp", { stdio: "pipe" });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.stdout.toString()
    };
  }
}
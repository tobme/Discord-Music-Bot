// generate.js
import { planTask } from "./ai/planner.js";
import { generateCode } from "./ai/coder.js";
import { showDiff } from "./ai/diffViewer.js";
import { applyChanges } from "./ai/applyChanges.js";

async function main() {
  const task = process.argv.slice(2).join(" ");
  if (!task) {
    console.log("Usage: node generate.js <task description>");
    return;
  }

  // 1️⃣ Plan task
  const plan = await planTask(task);
  console.log("Plan:", plan);

  // 2️⃣ Generate code
  const changes = await generateCode(task, plan.filesToRead);

  // DEBUG: inspect generated changes
  console.dir(changes, { depth: null });

  showDiff(changes);

  // 3️⃣ Ask user to approve
  const readline = await import("readline/promises");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Apply these changes? (y/n) ");
  rl.close();

  if (answer.toLowerCase() === "y") {
    applyChanges(changes);
    console.log("Changes applied!");
  } else {
    console.log("Aborted.");
  }
}

main();
import dotenv from "dotenv";
dotenv.config();

import { cleanupThreads } from "./scripts/thread-cleanup";

async function main() {
  console.log("Running main")
}

console.log("Starting...");
main();
// cleanupThreads();
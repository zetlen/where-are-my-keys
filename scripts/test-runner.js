import { spawn } from "node:child_process";
import { glob } from "glob";

const files = await glob("test/**/*.test.ts");

if (files.length === 0) {
	console.error("No test files found!");
	process.exit(1);
}

const args = ["--import", "tsx", "--test", ...files];

const child = spawn("node", args, { stdio: "inherit" });

child.on("close", (code) => {
	process.exit(code ?? 1);
});

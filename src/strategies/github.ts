import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import { createShellTool } from "../tools/shell";
import type { Strategy } from "../types";

const isGithub = (val: string) =>
	/^gh[pousr]_[A-Za-z0-9_]{36,255}$/.test(val) ||
	/^github_pat_[A-Za-z0-9_]{22,255}$/.test(val);

const commonVars = ["GITHUB_TOKEN", "GH_TOKEN"];

export const githubStrategy: Strategy = {
	name: "GitHub",
	tools: [
		createEnvVarTool(commonVars, isGithub),
		createShellTool("gh auth token", isGithub),
		createEnvHeuristicTool(isGithub, commonVars),
		createFileProbeTool(
			[".env", ".env.local"],
			/^\s*(?:GITHUB_TOKEN|GH_TOKEN)\s*=\s*(.*)$/,
			isGithub,
		),
	],
};

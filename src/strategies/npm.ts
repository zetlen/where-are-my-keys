import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import { createShellTool } from "../tools/shell";
import type { Strategy } from "../types";

const isNpm = (val: string) =>
	/^npm_[A-Za-z0-9]{36}$/.test(val) || // Granular
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val); // Legacy UUID

const commonVars = ["NPM_TOKEN", "NODE_AUTH_TOKEN"];

export const npmStrategy: Strategy = {
	name: "NPM",
	tools: [
		createEnvVarTool(commonVars, isNpm),
		createShellTool("npm config get //registry.npmjs.org/:_authToken", isNpm),
		createEnvHeuristicTool(isNpm, commonVars),
		createFileProbeTool(
			[".npmrc", ".env"],
			/(?:_authToken|NPM_TOKEN|NODE_AUTH_TOKEN)\s*=\s*(.*)$/,
			isNpm,
		),
	],
};

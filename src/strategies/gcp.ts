import { createDotenvProbeTool } from "../tools/dotenv-probe";
import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import { createShellTool } from "../tools/shell";
import type { Strategy } from "../types";

// Validates raw tokens or JSON keys
const isGcp = (val: string) =>
	/^ya29\.[A-Za-z0-9\-_]{50,}$/.test(val) ||
	(val.includes('"private_key":') && val.includes('"client_email":'));

const commonVars = ["GOOGLE_APPLICATION_CREDENTIALS", "GCLOUD_TOKEN"];

export const gcpStrategy: Strategy = {
	name: "GCP",
	tools: [
		createEnvVarTool(commonVars, isGcp),
		createEnvHeuristicTool(isGcp, commonVars),
		createShellTool("gcloud auth print-access-token", isGcp),
		createFileProbeTool(
			["key.json", "service-account.json", ".env"],
			/^\s*(?:GOOGLE_CREDENTIALS)\s*=\s*(.*)$/,
			isGcp,
		),
		createDotenvProbeTool(isGcp),
	],
};

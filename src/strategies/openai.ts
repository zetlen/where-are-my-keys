import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import type { Strategy } from "../types";

// OpenAI keys start with sk- and are typically long alphanumeric strings
// Validates legacy keys (sk-...) and new project keys (sk-proj-...)
const isOpenAi = (val: string) => /^sk-[a-zA-Z0-9\-_]{20,}$/.test(val);

const commonVars = ["OPENAI_API_KEY", "OPENAI_API_SECRET"];

export const openaiStrategy: Strategy = {
	name: "OpenAI",
	tools: [
		createEnvVarTool(commonVars, isOpenAi),
		createEnvHeuristicTool(isOpenAi, commonVars),
		createFileProbeTool(
			[".env", ".env.local", ".env.development"],
			/^\s*(?:OPENAI_API_KEY|OPENAI_API_SECRET)\s*=\s*(.*)$/,
			isOpenAi,
		),
	],
};

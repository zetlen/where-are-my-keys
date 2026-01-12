import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import type { Strategy } from "../types";

// Google Gemini API keys are 39-character alphanumeric strings
const isGemini = (val: string) => /^AIza[a-zA-Z0-9\-_]{35}$/.test(val);

const commonVars = [
	"GEMINI_API_KEY",
	"GOOGLE_API_KEY",
	"GOOGLE_GENERATIVE_AI_API_KEY",
];

export const geminiStrategy: Strategy = {
	name: "Gemini",
	tools: [
		createEnvVarTool(commonVars, isGemini),
		createEnvHeuristicTool(isGemini, commonVars),
		createFileProbeTool(
			[".env", ".env.local", ".env.development"],
			/^\s*(?:GEMINI_API_KEY|GOOGLE_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY)\s*=\s*(.*)$/,
			isGemini,
		),
	],
};

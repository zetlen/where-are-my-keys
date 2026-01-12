import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import type { Strategy } from "../types";

// Anthropic API keys start with sk-ant- followed by alphanumeric characters
const isAnthropic = (val: string) => /^sk-ant-[a-zA-Z0-9\-_]{20,}$/.test(val);

const commonVars = ["ANTHROPIC_API_KEY", "CLAUDE_API_KEY"];

export const anthropicStrategy: Strategy = {
	name: "Anthropic",
	tools: [
		createEnvVarTool(commonVars, isAnthropic),
		createEnvHeuristicTool(isAnthropic, commonVars),
		createFileProbeTool(
			[".env", ".env.local", ".env.development"],
			/^\s*(?:ANTHROPIC_API_KEY|CLAUDE_API_KEY)\s*=\s*(.*)$/,
			isAnthropic,
		),
	],
};

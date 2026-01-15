import { createDotenvProbeTool } from "../tools/dotenv-probe";
import { createEnvHeuristicTool } from "../tools/env-heuristic";
import { createEnvVarTool } from "../tools/env-var";
import { createFileProbeTool } from "../tools/file-probe";
import { createShellTool } from "../tools/shell";
import type { Strategy } from "../types";

const isAws = (val: string) => /^(AKIA|ASIA)[A-Z0-9]{16}$/.test(val);
const commonVars = ["AWS_ACCESS_KEY_ID", "AWS_ACCESS_KEY"];

export const awsStrategy: Strategy = {
	name: "AWS",
	tools: [
		createEnvVarTool(commonVars, isAws),
		createEnvHeuristicTool(isAws, commonVars),
		createShellTool("aws configure get aws_access_key_id", isAws),
		createFileProbeTool(
			[".env", ".aws/credentials"],
			/^\s*(?:aws_access_key_id|AWS_ACCESS_KEY_ID)\s*=\s*(.*)$/,
			isAws,
		),
		createDotenvProbeTool(isAws),
	],
};

import type { TokenValidator, Tool } from "../types";

export function createEnvHeuristicTool(
	validator: TokenValidator,
	ignoreKeys: string[] = [],
): Tool {
	const ignoreSet = new Set(ignoreKeys);

	return async () => {
		for (const [key, val] of Object.entries(process.env)) {
			if (ignoreSet.has(key)) continue;
			if (typeof val === "string" && validator(val)) {
				return {
					message: `Found via heuristic scan in environment variable: ${key}`,
					envVar: key,
				};
			}
		}
		return null;
	};
}

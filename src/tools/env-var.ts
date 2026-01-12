import type { TokenValidator, Tool } from "../types";

export function createEnvVarTool(
	keys: string[],
	validator: TokenValidator,
): Tool {
	return async () => {
		for (const key of keys) {
			const val = process.env[key];
			if (val && validator(val)) {
				return {
					message: `Found in environment variable: ${key}`,
					envVar: key,
				};
			}
		}
		return null;
	};
}

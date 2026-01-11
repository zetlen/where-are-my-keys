import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { TokenValidator, Tool } from "../types";

const execAsync = promisify(exec);

export function createShellTool(
	command: string,
	validator: TokenValidator,
	transform: (s: string) => string = (s) => s,
): Tool {
	return async () => {
		try {
			const { stdout } = await execAsync(command, {
				timeout: 2500,
				encoding: "utf8",
			});
			const token = transform(stdout.trim());
			if (validator(token)) {
				return { token, source: `Shell Command (${command})` };
			}
		} catch (_e) {
			// ignore command failures
		}
		return null;
	};
}

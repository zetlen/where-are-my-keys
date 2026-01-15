import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";
import type { TokenValidator, Tool } from "../types";

const DOTENV_FILENAMES = [
	".env",
	".env.local",
	".env.development",
	".env.development.local",
];

function parseDotenv(content: string): Map<string, string> {
	const result = new Map<string, string>();
	const lines = content.split(/\r?\n/);

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
		if (!match) continue;

		// Remove surrounding quotes
		if (value.startsWith('"') && value.endsWith('"')) {
			value = value.slice(1, -1);
		} else if (value.startsWith("'") && value.endsWith("'")) {
			value = value.slice(1, -1);
		}
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		result.set(key, value);
	}

	return result;
}

async function findDotenvFiles(startDir: string): Promise<string[]> {
	const found: string[] = [];
	let currentDir = startDir;
	const root = parse(currentDir).root;

	while (currentDir !== root) {
		for (const filename of DOTENV_FILENAMES) {
			const filePath = join(currentDir, filename);
			try {
				await access(filePath, constants.R_OK);
				found.push(filePath);
			} catch {
				// File doesn't exist or isn't readable
			}
		}
		currentDir = dirname(currentDir);
	}

	return found;
}

export function createDotenvProbeTool(validator: TokenValidator): Tool {
	return async () => {
		const dotenvFiles = await findDotenvFiles(process.cwd());

		for (const filePath of dotenvFiles) {
			try {
				const content = await readFile(filePath, "utf8");
				const vars = parseDotenv(content);

				for (const [key, value] of vars) {
					if (validator(value)) {
						return {
							message: `Found in unloaded dotenv file: ${filePath}`,
							file: filePath,
							envVar: key,
						};
					}
				}
			} catch {
				// Ignore read errors
			}
		}

		return null;
	};
}

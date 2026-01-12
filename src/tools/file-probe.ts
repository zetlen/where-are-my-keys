import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { TokenValidator, Tool } from "../types";

export function createFileProbeTool(
	filenames: string[],
	regex: RegExp,
	validator: TokenValidator,
): Tool {
	return async () => {
		for (const file of filenames) {
			const filePath = resolve(process.cwd(), file);

			try {
				await access(filePath, constants.R_OK);
				const content = await readFile(filePath, "utf8");
				const lines = content.split(/\r?\n/);

				for (const line of lines) {
					const match = line.match(regex);
					if (match) {
						let value = match[1] || match[2];
						if (!value) continue;

						// Clean surrounding quotes
						value = value.trim().replace(/^['"]|['"]$/g, "");

						if (validator(value)) {
							return { message: `Found in file: ${file}`, file };
						}
					}
				}
			} catch (_err) {
				// ignore read errors or missing files
			}
		}
		return null;
	};
}

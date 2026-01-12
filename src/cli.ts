#!/usr/bin/env node
import { getToken, strategies } from "./index";

(async () => {
	const args = process.argv.slice(2);
	const jsonFlag = args.includes("--json");
	const positionalArgs = args.filter((arg) => !arg.startsWith("--"));
	const mode = positionalArgs[0];

	if (!mode) {
		console.error(
			`Usage: where-are-my-keys <provider> [--json]\nProviders: ${Object.keys(strategies).join(", ")}`,
		);
		process.exit(1);
	}

	if (!strategies[mode]) {
		console.error(
			`Invalid provider "${mode}". Try: ${Object.keys(strategies).join(", ")}`,
		);
		process.exit(1);
	}

	try {
		const result = await getToken(mode);

		if (jsonFlag) {
			const output = result
				? {
						found: true,
						provider: mode,
						envVar: result.envVar ?? null,
						file: result.file ?? null,
						command: result.command ?? null,
					}
				: { found: false, provider: mode };
			console.log(JSON.stringify(output, null, 2));
			if (!result) process.exit(1);
		} else {
			if (result) {
				console.log(result.message);

				if (result.envVar) console.log(`  Variable: ${result.envVar}`);
				if (result.file) console.log(`  File: ${result.file}`);
				if (result.command) console.log(`  Command: ${result.command}`);
			} else {
				console.error(`No ${mode} credentials found.`);
				process.exit(1);
			}
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error("An unknown error occurred");
		}
		process.exit(1);
	}
})();

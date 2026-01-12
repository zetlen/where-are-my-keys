#!/usr/bin/env node
import { getToken, strategies } from "./index";

(async () => {
	const mode = process.argv[2] || "github";

	if (!strategies[mode]) {
		console.error(
			`Invalid provider "${mode}". Try: ${Object.keys(strategies).join(", ")}`,
		);
		process.exit(1);
	}

	try {
		const result = await getToken(mode);

		if (result) {
			console.log(result.message);

			if (result.envVar) console.log(`  Variable: ${result.envVar}`);
			if (result.file) console.log(`  File: ${result.file}`);
			if (result.command) console.log(`  Command: ${result.command}`);
		} else {
			console.error(`No ${mode} credentials found.`);
			process.exit(1);
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

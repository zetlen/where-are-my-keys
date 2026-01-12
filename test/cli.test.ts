import assert from "node:assert";
import { execSync } from "node:child_process";
import { after, beforeEach, describe, it } from "node:test";

// Must clear sensitive environment vars so CI detection doesn't strip metadata
const sensitiveEnvVars = [
	"CI",
	"GITHUB_ACTIONS",
	"GITLAB_CI",
	"CIRCLECI",
	"TRAVIS",
	"BUILDKITE",
	"NODE_ENV",
];

describe("CLI", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	after(() => {
		process.env = originalEnv;
	});

	const runCli = (args: string, env?: Record<string, string>) => {
		// Build a clean env without CI variables
		const cleanEnv = { ...process.env };
		for (const v of sensitiveEnvVars) {
			delete cleanEnv[v];
		}

		try {
			const result = execSync(`npx tsx src/cli.ts ${args}`, {
				encoding: "utf-8",
				env: { ...cleanEnv, ...env },
			});
			return { output: result, exitCode: 0 };
		} catch (error: unknown) {
			const execError = error as {
				stdout?: string;
				stderr?: string;
				status?: number;
			};
			return {
				output: (execError.stdout || "") + (execError.stderr || ""),
				exitCode: execError.status || 1,
			};
		}
	};

	describe("--json flag", () => {
		it("should output JSON when --json flag is provided", () => {
			const { output } = runCli("github --json", {
				GITHUB_TOKEN: "ghp_000000000000000000000000000000000000",
			});
			const result = JSON.parse(output);

			assert.strictEqual(result.found, true);
			assert.strictEqual(result.provider, "github");
			assert.strictEqual(result.envVar, "GITHUB_TOKEN");
		});

		it("should work with --json flag before provider", () => {
			const { output } = runCli("--json github", {
				GITHUB_TOKEN: "ghp_000000000000000000000000000000000000",
			});
			const result = JSON.parse(output);

			assert.strictEqual(result.found, true);
			assert.strictEqual(result.provider, "github");
		});

		it("should include provider in JSON output", () => {
			const { output } = runCli("npm --json", {
				NPM_TOKEN: "npm_000000000000000000000000000000000000",
			});
			const result = JSON.parse(output);

			assert.strictEqual(typeof result.found, "boolean");
			assert.strictEqual(result.provider, "npm");
			assert.ok("envVar" in result || "file" in result || "command" in result);
		});

		it("should include null for missing metadata fields", () => {
			const { output } = runCli("github --json", {
				GITHUB_TOKEN: "ghp_000000000000000000000000000000000000",
			});
			const result = JSON.parse(output);

			assert.strictEqual(result.file, null);
			assert.strictEqual(result.command, null);
		});
	});

	describe("usage", () => {
		it("should show usage when no provider specified", () => {
			const { output, exitCode } = runCli("");

			assert.match(output, /Usage:/);
			assert.match(output, /Providers:/);
			assert.strictEqual(exitCode, 1);
		});

		it("should show error for invalid provider", () => {
			const { output, exitCode } = runCli("invalid");

			assert.match(output, /Invalid provider/);
			assert.strictEqual(exitCode, 1);
		});
	});
});

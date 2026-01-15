import assert from "node:assert";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, beforeEach, describe, it } from "node:test";
import { createDotenvProbeTool } from "../src/tools/dotenv-probe";
import { createEnvHeuristicTool } from "../src/tools/env-heuristic";
import { createEnvVarTool } from "../src/tools/env-var";

describe("Tools", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	after(() => {
		process.env = originalEnv;
	});

	describe("EnvVarTool", () => {
		it("should find a valid token in environment variables", async () => {
			process.env.TEST_TOKEN = "valid-token";
			const validator = (val: string) => val === "valid-token";
			const tool = createEnvVarTool(["TEST_TOKEN"], validator);

			const result = await tool();
			assert.ok(result);
			assert.strictEqual(result.envVar, "TEST_TOKEN");
			assert.strictEqual(
				result.message,
				"Found in environment variable: TEST_TOKEN",
			);
		});

		it("should return null if key exists but invalid", async () => {
			process.env.TEST_TOKEN = "invalid";
			const validator = (val: string) => val === "valid";
			const tool = createEnvVarTool(["TEST_TOKEN"], validator);

			const result = await tool();
			assert.strictEqual(result, null);
		});

		it("should return null if key does not exist", async () => {
			const validator = (_val: string) => true;
			const tool = createEnvVarTool(["NON_EXISTENT"], validator);

			const result = await tool();
			assert.strictEqual(result, null);
		});
	});

	describe("EnvHeuristicTool", () => {
		it("should find token by scanning environment", async () => {
			process.env.SOME_RANDOM_KEY = "secret-value";
			const validator = (val: string) => val === "secret-value";
			const tool = createEnvHeuristicTool(validator, []);

			const result = await tool();
			assert.ok(result);
			assert.strictEqual(result.envVar, "SOME_RANDOM_KEY");
			assert.strictEqual(
				result.message,
				"Found via heuristic scan in environment variable: SOME_RANDOM_KEY",
			);
		});

		it("should ignore specified keys", async () => {
			process.env.IGNORED_KEY = "secret";
			const validator = (val: string) => val === "secret";
			const tool = createEnvHeuristicTool(validator, ["IGNORED_KEY"]);

			const result = await tool();
			assert.strictEqual(result, null);
		});
	});

	describe("DotenvProbeTool", () => {
		const testDir = join(tmpdir(), `dotenv-probe-test-${Date.now()}`);
		const originalCwd = process.cwd();

		beforeEach(async () => {
			await mkdir(testDir, { recursive: true });
			process.chdir(testDir);
		});

		after(async () => {
			process.chdir(originalCwd);
			await rm(testDir, { recursive: true, force: true });
		});

		it("should find token in .env file", async () => {
			await writeFile(join(testDir, ".env"), "MY_SECRET=secret-token-123\n");
			const validator = (val: string) => val === "secret-token-123";
			const tool = createDotenvProbeTool(validator);

			const result = await tool();
			assert.ok(result);
			assert.ok(result.file?.endsWith(".env"));
			assert.strictEqual(result.envVar, "MY_SECRET");
			assert.ok(result.message.includes("unloaded dotenv file"));
		});

		it("should find token in parent directory .env file", async () => {
			const subDir = join(testDir, "subdir");
			await mkdir(subDir, { recursive: true });
			await writeFile(join(testDir, ".env"), "PARENT_TOKEN=parent-secret\n");
			process.chdir(subDir);

			const validator = (val: string) => val === "parent-secret";
			const tool = createDotenvProbeTool(validator);

			const result = await tool();
			assert.ok(result);
			assert.strictEqual(result.envVar, "PARENT_TOKEN");
		});

		it("should return null when no matching token found", async () => {
			await writeFile(join(testDir, ".env"), "UNRELATED=value\n");
			const validator = (val: string) => val.startsWith("secret-");
			const tool = createDotenvProbeTool(validator);

			const result = await tool();
			assert.strictEqual(result, null);
		});

		it("should handle quoted values", async () => {
			await writeFile(join(testDir, ".env"), 'QUOTED_KEY="my-quoted-secret"\n');
			const validator = (val: string) => val === "my-quoted-secret";
			const tool = createDotenvProbeTool(validator);

			const result = await tool();
			assert.ok(result);
			assert.strictEqual(result.envVar, "QUOTED_KEY");
		});
	});
});

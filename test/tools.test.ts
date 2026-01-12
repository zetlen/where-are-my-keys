import assert from "node:assert";
import { after, beforeEach, describe, it } from "node:test";
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
});

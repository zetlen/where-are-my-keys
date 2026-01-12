import assert from "node:assert";
import { after, beforeEach, describe, it } from "node:test";
import { getToken } from "../src/index";

describe("Protection Logic", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
		// Reset specific env vars we might touch
		delete process.env.CI;
		delete process.env.GITHUB_ACTIONS;
		delete process.env.CIRCLECI;
		delete process.env.TRAVIS;
		delete process.env.GITLAB_CI;
		delete process.env.BUILDKITE;
		delete process.env.NODE_ENV;
	});

	after(() => {
		process.env = originalEnv;
	});

	it("should return metadata in a safe environment", async () => {
		process.env.TEST_TOKEN_SAFE = "secret";
		// We need to inject a mock strategy or use an existing one that matches.
		// Using NPM strategy for a quick test as it's simple regex on env vars.
		process.env.NPM_TOKEN = "npm_000000000000000000000000000000000000";

		const result = await getToken("npm");
		assert.ok(result);
		assert.strictEqual(result.found, true);
		assert.match(result.message, /Found in environment variable/);
		assert.strictEqual(result.envVar, "NPM_TOKEN");
	});

	it("should strip metadata and snark in CI environment", async () => {
		process.env.CI = "true";
		process.env.GITHUB_ACTIONS = "true";
		process.env.NPM_TOKEN = "npm_000000000000000000000000000000000000";

		const result = await getToken("npm");
		assert.ok(result);
		assert.strictEqual(result.found, true);
		// Message should start with the reason
		assert.match(result.message, /^Running in GitHub Actions/);
		// Should contain one of the snarky messages, so length should be > reason length
		assert.ok(result.message.length > "Running in GitHub Actions".length);

		// Metadata should be undefined
		assert.strictEqual(result.envVar, undefined);
		assert.strictEqual(result.file, undefined);
		assert.strictEqual(result.command, undefined);
	});

	it("should strip metadata and snark in Production environment", async () => {
		process.env.NODE_ENV = "production";
		process.env.NPM_TOKEN = "npm_000000000000000000000000000000000000";

		const result = await getToken("npm");
		assert.ok(result);
		assert.strictEqual(result.found, true);
		assert.match(result.message, /^Running in production/);
		assert.strictEqual(result.envVar, undefined);
	});
});

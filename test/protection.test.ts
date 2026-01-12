import assert from "node:assert";
import { after, beforeEach, describe, it } from "node:test";
import { getToken } from "../src/index";
import {
	detectSensitiveEnvironment,
	getNoPrintReason,
} from "../src/sensitive-environments";

const sensitiveEnvVars = [
	// CI
	"CI",
	"GITHUB_ACTIONS",
	"CIRCLECI",
	"TRAVIS",
	"GITLAB_CI",
	"BUILDKITE",
	"JENKINS_URL",
	"BUILD_ID",
	"TF_BUILD",
	"BITBUCKET_PIPELINES",
	"TEAMCITY_VERSION",
	"CODEBUILD_BUILD_ID",
	"BUILDER_OUTPUT",
	"DRONE",
	"SEMAPHORE",
	"HARNESS_BUILD_ID",
	"APPVEYOR",
	"JOB_ID",
	"JOB_URL",
	// Serverless
	"AWS_LAMBDA_FUNCTION_NAME",
	"FUNCTION_NAME",
	"GCP_PROJECT",
	"FUNCTIONS_WORKER_RUNTIME",
	"CF_PAGES",
	"DENO_DEPLOYMENT_ID",
	// PaaS
	"VERCEL",
	"NETLIFY",
	"RENDER",
	"FLY_APP_NAME",
	"RAILWAY_ENVIRONMENT",
	"DYNO",
	"DIGITALOCEAN_APP_ID",
	"REPL_ID",
	// Container
	"KUBERNETES_SERVICE_HOST",
	"ECS_CONTAINER_METADATA_URI",
	"K_SERVICE",
	"K_REVISION",
	// Production
	"NODE_ENV",
	"ENVIRONMENT",
	"ENV",
	"APP_ENV",
];

describe("Protection Logic", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
		for (const v of sensitiveEnvVars) {
			delete process.env[v];
		}
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

describe("Sensitive Environment Detection", () => {
	describe("CI/CD Platforms", () => {
		it("should detect Jenkins", () => {
			const result = detectSensitiveEnvironment({
				JENKINS_URL: "http://jenkins.local",
				BUILD_ID: "123",
			});
			assert.strictEqual(result?.name, "Jenkins");
			assert.strictEqual(result?.category, "ci");
		});

		it("should detect Azure DevOps", () => {
			const result = detectSensitiveEnvironment({ TF_BUILD: "True" });
			assert.strictEqual(result?.name, "Azure DevOps");
			assert.strictEqual(result?.category, "ci");
		});

		it("should detect Bitbucket Pipelines", () => {
			const result = detectSensitiveEnvironment({
				BITBUCKET_PIPELINES: "true",
			});
			assert.strictEqual(result?.name, "Bitbucket Pipelines");
		});

		it("should detect TeamCity", () => {
			const result = detectSensitiveEnvironment({
				TEAMCITY_VERSION: "2023.05",
			});
			assert.strictEqual(result?.name, "TeamCity");
		});

		it("should detect AWS CodeBuild", () => {
			const result = detectSensitiveEnvironment({
				CODEBUILD_BUILD_ID: "build:123",
			});
			assert.strictEqual(result?.name, "AWS CodeBuild");
		});

		it("should detect Google Cloud Build", () => {
			const result = detectSensitiveEnvironment({
				BUILDER_OUTPUT: "/workspace/output",
			});
			assert.strictEqual(result?.name, "Google Cloud Build");
		});

		it("should detect Drone CI", () => {
			const result = detectSensitiveEnvironment({ DRONE: "true" });
			assert.strictEqual(result?.name, "Drone CI");
		});

		it("should detect Semaphore CI", () => {
			const result = detectSensitiveEnvironment({ SEMAPHORE: "true" });
			assert.strictEqual(result?.name, "Semaphore CI");
		});

		it("should fall back to generic CI when CI=true but no specific platform", () => {
			const result = detectSensitiveEnvironment({ CI: "true" });
			assert.strictEqual(result?.name, "CI environment");
		});
	});

	describe("Serverless Platforms", () => {
		it("should detect AWS Lambda", () => {
			const result = detectSensitiveEnvironment({
				AWS_LAMBDA_FUNCTION_NAME: "my-function",
			});
			assert.strictEqual(result?.name, "AWS Lambda");
			assert.strictEqual(result?.category, "serverless");
		});

		it("should detect Cloudflare Pages", () => {
			const result = detectSensitiveEnvironment({ CF_PAGES: "1" });
			assert.strictEqual(result?.name, "Cloudflare Pages");
		});

		it("should detect Azure Functions", () => {
			const result = detectSensitiveEnvironment({
				FUNCTIONS_WORKER_RUNTIME: "node",
			});
			assert.strictEqual(result?.name, "Azure Functions");
		});
	});

	describe("PaaS Platforms", () => {
		it("should detect Vercel", () => {
			const result = detectSensitiveEnvironment({ VERCEL: "1" });
			assert.strictEqual(result?.name, "Vercel");
			assert.strictEqual(result?.category, "paas");
		});

		it("should detect Netlify", () => {
			const result = detectSensitiveEnvironment({ NETLIFY: "true" });
			assert.strictEqual(result?.name, "Netlify");
		});

		it("should detect Render", () => {
			const result = detectSensitiveEnvironment({ RENDER: "true" });
			assert.strictEqual(result?.name, "Render");
		});

		it("should detect Fly.io", () => {
			const result = detectSensitiveEnvironment({ FLY_APP_NAME: "my-app" });
			assert.strictEqual(result?.name, "Fly.io");
		});

		it("should detect Railway", () => {
			const result = detectSensitiveEnvironment({
				RAILWAY_ENVIRONMENT: "production",
			});
			assert.strictEqual(result?.name, "Railway");
		});

		it("should detect Heroku", () => {
			const result = detectSensitiveEnvironment({ DYNO: "web.1" });
			assert.strictEqual(result?.name, "Heroku");
		});
	});

	describe("Container Orchestration", () => {
		it("should detect Kubernetes", () => {
			const result = detectSensitiveEnvironment({
				KUBERNETES_SERVICE_HOST: "10.0.0.1",
			});
			assert.strictEqual(result?.name, "Kubernetes");
			assert.strictEqual(result?.category, "container");
		});

		it("should detect Amazon ECS", () => {
			const result = detectSensitiveEnvironment({
				ECS_CONTAINER_METADATA_URI: "http://169.254.170.2/v3",
			});
			assert.strictEqual(result?.name, "Amazon ECS");
		});

		it("should detect Google Cloud Run", () => {
			const result = detectSensitiveEnvironment({
				K_SERVICE: "my-service",
				K_REVISION: "rev-001",
			});
			assert.strictEqual(result?.name, "Google Cloud Run");
		});
	});

	describe("Production Indicators", () => {
		it("should detect NODE_ENV=production", () => {
			const result = detectSensitiveEnvironment({ NODE_ENV: "production" });
			assert.strictEqual(result?.category, "production");
		});

		it("should detect ENVIRONMENT=production", () => {
			const result = detectSensitiveEnvironment({ ENVIRONMENT: "production" });
			assert.strictEqual(result?.category, "production");
		});

		it("should detect APP_ENV=production", () => {
			const result = detectSensitiveEnvironment({ APP_ENV: "production" });
			assert.strictEqual(result?.category, "production");
		});

		it("should not detect NODE_ENV=development", () => {
			const result = detectSensitiveEnvironment({ NODE_ENV: "development" });
			assert.strictEqual(result, null);
		});
	});

	describe("Priority ordering", () => {
		it("should prefer specific CI platform over generic CI", () => {
			const result = detectSensitiveEnvironment({
				CI: "true",
				GITHUB_ACTIONS: "true",
			});
			assert.strictEqual(result?.name, "GitHub Actions");
		});

		it("should prefer serverless over production indicator", () => {
			const result = detectSensitiveEnvironment({
				AWS_LAMBDA_FUNCTION_NAME: "fn",
				NODE_ENV: "production",
			});
			assert.strictEqual(result?.name, "AWS Lambda");
		});
	});

	describe("getNoPrintReason formatting", () => {
		it("should format CI environments as 'Running in'", () => {
			const reason = getNoPrintReason({ GITHUB_ACTIONS: "true" });
			assert.strictEqual(reason, "Running in GitHub Actions");
		});

		it("should format PaaS environments as 'Running on'", () => {
			const reason = getNoPrintReason({ VERCEL: "1" });
			assert.strictEqual(reason, "Running on Vercel");
		});

		it("should return null for safe environments", () => {
			const reason = getNoPrintReason({ NODE_ENV: "development" });
			assert.strictEqual(reason, null);
		});
	});

	describe("Safe environments", () => {
		it("should return null when no sensitive environment detected", () => {
			const result = detectSensitiveEnvironment({});
			assert.strictEqual(result, null);
		});
	});
});

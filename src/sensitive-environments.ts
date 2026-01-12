import type {
	EnvironmentDetector,
	SensitiveEnvironmentCategory,
} from "./types";

const detectors: EnvironmentDetector[] = [
	// =====================
	// CI/CD PLATFORMS
	// =====================

	{
		name: "GitHub Actions",
		category: "ci",
		priority: 10,
		detect: (env) => env.GITHUB_ACTIONS === "true",
	},
	{
		name: "GitLab CI",
		category: "ci",
		priority: 10,
		detect: (env) => env.GITLAB_CI === "true",
	},
	{
		name: "CircleCI",
		category: "ci",
		priority: 10,
		detect: (env) => env.CIRCLECI === "true",
	},
	{
		name: "Travis CI",
		category: "ci",
		priority: 10,
		detect: (env) => env.TRAVIS === "true",
	},
	{
		name: "Buildkite",
		category: "ci",
		priority: 10,
		detect: (env) => env.BUILDKITE === "true",
	},
	{
		name: "Jenkins",
		category: "ci",
		priority: 15,
		detect: (env) => Boolean(env.JENKINS_URL && env.BUILD_ID),
	},
	{
		name: "Azure DevOps",
		category: "ci",
		priority: 15,
		detect: (env) => env.TF_BUILD === "True",
	},
	{
		name: "Bitbucket Pipelines",
		category: "ci",
		priority: 15,
		detect: (env) => env.BITBUCKET_PIPELINES === "true",
	},
	{
		name: "TeamCity",
		category: "ci",
		priority: 15,
		detect: (env) => Boolean(env.TEAMCITY_VERSION),
	},
	{
		name: "AWS CodeBuild",
		category: "ci",
		priority: 15,
		detect: (env) => Boolean(env.CODEBUILD_BUILD_ID),
	},
	{
		name: "Google Cloud Build",
		category: "ci",
		priority: 15,
		detect: (env) => Boolean(env.BUILDER_OUTPUT),
	},
	{
		name: "Drone CI",
		category: "ci",
		priority: 20,
		detect: (env) => env.DRONE === "true",
	},
	{
		name: "Semaphore CI",
		category: "ci",
		priority: 20,
		detect: (env) => env.SEMAPHORE === "true",
	},
	{
		name: "Harness CI",
		category: "ci",
		priority: 20,
		detect: (env) => Boolean(env.HARNESS_BUILD_ID),
	},
	{
		name: "AppVeyor",
		category: "ci",
		priority: 20,
		detect: (env) => env.APPVEYOR === "True",
	},
	{
		name: "Woodpecker CI",
		category: "ci",
		priority: 20,
		detect: (env) => env.CI === "woodpecker",
	},
	{
		name: "Sourcehut",
		category: "ci",
		priority: 20,
		detect: (env) =>
			Boolean(env.JOB_ID && env.JOB_URL?.includes("builds.sr.ht")),
	},
	// Generic CI fallback - must be last in CI category
	{
		name: "CI environment",
		category: "ci",
		priority: 99,
		detect: (env) => env.CI === "true" || env.CI === "1",
	},

	// =====================
	// SERVERLESS / FaaS
	// =====================

	{
		name: "AWS Lambda",
		category: "serverless",
		priority: 10,
		detect: (env) => Boolean(env.AWS_LAMBDA_FUNCTION_NAME),
	},
	{
		name: "Google Cloud Functions",
		category: "serverless",
		priority: 10,
		detect: (env) => Boolean(env.FUNCTION_NAME && env.GCP_PROJECT),
	},
	{
		name: "Azure Functions",
		category: "serverless",
		priority: 10,
		detect: (env) => Boolean(env.FUNCTIONS_WORKER_RUNTIME),
	},
	{
		name: "Cloudflare Pages",
		category: "serverless",
		priority: 15,
		detect: (env) => env.CF_PAGES === "1",
	},
	{
		name: "Deno Deploy",
		category: "serverless",
		priority: 15,
		detect: (env) => Boolean(env.DENO_DEPLOYMENT_ID),
	},

	// =====================
	// PaaS PLATFORMS
	// =====================

	{
		name: "Vercel",
		category: "paas",
		priority: 10,
		detect: (env) => env.VERCEL === "1",
	},
	{
		name: "Netlify",
		category: "paas",
		priority: 10,
		detect: (env) => env.NETLIFY === "true",
	},
	{
		name: "Render",
		category: "paas",
		priority: 15,
		detect: (env) => env.RENDER === "true",
	},
	{
		name: "Fly.io",
		category: "paas",
		priority: 15,
		detect: (env) => Boolean(env.FLY_APP_NAME),
	},
	{
		name: "Railway",
		category: "paas",
		priority: 15,
		detect: (env) => Boolean(env.RAILWAY_ENVIRONMENT),
	},
	{
		name: "Heroku",
		category: "paas",
		priority: 20,
		detect: (env) => Boolean(env.DYNO),
	},
	{
		name: "DigitalOcean App Platform",
		category: "paas",
		priority: 20,
		detect: (env) => Boolean(env.DIGITALOCEAN_APP_ID),
	},
	{
		name: "Replit",
		category: "paas",
		priority: 25,
		detect: (env) => Boolean(env.REPL_ID),
	},

	// =====================
	// CONTAINER ORCHESTRATION
	// =====================

	{
		name: "Kubernetes",
		category: "container",
		priority: 10,
		detect: (env) => Boolean(env.KUBERNETES_SERVICE_HOST),
	},
	{
		name: "Amazon ECS",
		category: "container",
		priority: 15,
		detect: (env) => Boolean(env.ECS_CONTAINER_METADATA_URI),
	},
	{
		name: "Google Cloud Run",
		category: "container",
		priority: 15,
		detect: (env) => Boolean(env.K_SERVICE && env.K_REVISION),
	},

	// =====================
	// PRODUCTION INDICATORS
	// =====================

	{
		name: "production",
		category: "production",
		priority: 100,
		detect: (env) => env.NODE_ENV === "production",
	},
	{
		name: "production",
		category: "production",
		priority: 101,
		detect: (env) =>
			env.ENVIRONMENT === "production" ||
			env.ENV === "production" ||
			env.APP_ENV === "production",
	},
];

const sortedDetectors = [...detectors].sort(
	(a, b) => (a.priority ?? 100) - (b.priority ?? 100),
);

interface DetectionResult {
	name: string;
	category: SensitiveEnvironmentCategory;
}

export function detectSensitiveEnvironment(
	env: NodeJS.ProcessEnv = process.env,
): DetectionResult | null {
	for (const detector of sortedDetectors) {
		if (detector.detect(env)) {
			return {
				name: detector.name,
				category: detector.category,
			};
		}
	}
	return null;
}

export function getNoPrintReason(
	env: NodeJS.ProcessEnv = process.env,
): string | null {
	const result = detectSensitiveEnvironment(env);
	if (!result) return null;

	switch (result.category) {
		case "ci":
			return `Running in ${result.name}`;
		case "serverless":
			return `Running in ${result.name}`;
		case "paas":
			return `Running on ${result.name}`;
		case "container":
			return `Running in ${result.name}`;
		case "production":
			return "Running in production";
		default:
			return `Running in ${result.name}`;
	}
}

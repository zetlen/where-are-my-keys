import { strategies } from "./strategies";
import type { TokenResult } from "./types";

export async function getToken(
	type: string = "github",
): Promise<TokenResult | null> {
	const strategy = strategies[type.toLowerCase()];

	if (!strategy) {
		throw new Error(
			`Unknown strategy: ${type}. Supported: ${Object.keys(strategies).join(", ")}`,
		);
	}

	const envReason = getEnvironmentReason();

	for (const tool of strategy.tools) {
		const result = await tool();
		if (result) {
			if (envReason) {
				const randomSnark =
					snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
				return {
					found: true,
					message: `${envReason} ${randomSnark}`,
				};
			}
			return { ...result, found: true };
		}
	}

	return {
		found: false,
		message: `No ${type} credentials found in environment.`,
	};
}

const snarkyMessages = [
	"Yeah it's in here somewhere. No I won't say where. We're in public!",
	"I see them. You can't.",
	"Security through obscurity is my passion.",
	"Nice try, h4x0r.",
	"I'm afraid I can't let you do that, Dave.",
	"Credentials found, but my lips are sealed.",
	"I could tell you, but then I'd have to kill -9 you.",
	"Access Denied. Have you tried asking nicely?",
	"Your keys are in another castle.",
	"403 Forbidden: You are not authorized to view this location.",
	"Loose lips sink ships, and print tokens.",
	"This incident will be reported.",
	"Nothing to see here, move along.",
	"My memory is perfect, unlike yours.",
	"You shall not pass!",
	"Keep it secret. Keep it safe.",
];

function getEnvironmentReason(): string | null {
	if (process.env.CI) {
		if (process.env.GITHUB_ACTIONS) return "Running in GitHub Actions";
		if (process.env.CIRCLECI) return "Running in CircleCI";
		if (process.env.TRAVIS) return "Running in Travis CI";
		if (process.env.GITLAB_CI) return "Running in GitLab CI";
		if (process.env.BUILDKITE) return "Running in Buildkite CI";
		return "Running in CI environment";
	}
	if (process.env.NODE_ENV === "production") return "Running in production";
	return null;
}

export { strategies };
export * from "./types";

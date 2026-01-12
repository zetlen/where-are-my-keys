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

	const noPrintReason = getNoPrintReason();

	for (const tool of strategy.tools) {
		const result = await tool();
		if (result) {
			return noPrintReason
				? {
						found: true,
						message: `${noPrintReason}, will not report location of ${type} secret. ${beUnhelpful()}`,
					}
				: {
						...result,
						found: true,
					};
		}
	}
	return { found: false, message: `Could not find ${type} secret.` };
}

/**
 * Taunts displayed when a secret is found but we're in a sensitive environment
 * (CI, production) where revealing the location would be a security risk.
 * These messages confirm the secret exists without helping attackers find it.
 */
const taunts = [
	"It's around here somewhere.",
	"Get real, I'm not telling you more than that.",
	"Nice try, threat actor.",
	"Or maybe it's lbh-guvax-guvf-erirnyf-frperg-xrlf-va-frafvgvir-raivebazragf-lbh-pna-rng-zl-fubegf",
	"┐(￣～￣)┌",
	"Exfiltrate deez nulls.",
	"Have you tried looking under the couch cushions?",
	"I found it! Just kidding.",
	"Your threat model called. It's embarrassed.",
	"Imagine mass-assigning your way out of this one.",
	"L + ratio + no secrets for you.",
	"This isn't the credential you're looking for. 👋",
	"Error: insufficient vibes.",
	"Go fish.",
	"Skill issue.",
	"The secret is stored next to your reading comprehension.",
	"404 Trust Not Found.",
	"Maybe the real tokens were the friends we made along the way.",
	"Bruh.",
	"Ask nicely next time. Actually, don't.",
	"ಠ_ಠ",
];

const beUnhelpful = () => taunts[Math.floor(Math.random() * taunts.length)];

function getNoPrintReason(): string | null {
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

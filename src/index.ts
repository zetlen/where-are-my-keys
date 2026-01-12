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

const taunts = [
	"It's around here somewhere",
	"Get real, I'm not telling you more than that",
	"Nice try, threat actor",
	"Or maybe it's lbh-guvax-guvf-erirnyf-frperg-xrlf-va-frafvgvir-raivebazragf-lbh-pna-rng-zl-fubegf",
	"┐(￣～￣)┌",
	"Exfiltrate deez nulls",
	"Have you tried looking under the couch cushions",
	"Your threat model called. It's crying",
	"Imagine mass-assigning your way out of this one",
	"L + ratio",
	"Go fish",
	"Skill issue",
	"Maybe the real auth tokens were the friends we made along the way",
	"Bruh.",
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

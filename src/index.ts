import { getNoPrintReason } from "./sensitive-environments";
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
	"Maybe you could have tried harder?",
	"Your threat model called. It's crying",
	"Imagine mass-assigning your way out of this one",
	"L + ratio",
	"Go fish",
	"Skill issue",
	"JK it's hunter2",
	"Maybe the real exposed secrets were the friends we made along the way",
	"Bruh",
	"ಠ_ಠ",
	"Baba booey",
	"Bestie, ",
	"Sir this is a GitHub Action",
	"Oh no!! Anyway",
	"Let's fold scarves!",
];

const beUnhelpful = () => taunts[Math.floor(Math.random() * taunts.length)];

export { strategies };
export * from "./types";

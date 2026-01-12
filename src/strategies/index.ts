import type { Strategy } from "../types";
import { anthropicStrategy } from "./anthropic";
import { awsStrategy } from "./aws";
import { gcpStrategy } from "./gcp";
import { geminiStrategy } from "./gemini";
import { githubStrategy } from "./github";
import { npmStrategy } from "./npm";
import { openaiStrategy } from "./openai";

export const strategies: Record<string, Strategy> = {
	github: githubStrategy,
	npm: npmStrategy,
	aws: awsStrategy,
	gcp: gcpStrategy,
	openai: openaiStrategy,
	anthropic: anthropicStrategy,
	gemini: geminiStrategy,
};

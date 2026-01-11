export interface TokenResult {
	token: string;
	source: string;
}

export type TokenValidator = (value: string) => boolean;

export type Tool = () => Promise<TokenResult | null>;

export interface Strategy {
	name: string;
	tools: Tool[];
}

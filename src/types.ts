export interface TokenResult {
	message: string;
	envVar?: string;
	file?: string;
	command?: string;
	found?: boolean;
}

export type TokenValidator = (value: string) => boolean;

export type Tool = () => Promise<TokenResult | null>;

export interface Strategy {
	name: string;
	tools: Tool[];
}

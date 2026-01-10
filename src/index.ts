import { strategies } from './strategies';
import type { TokenResult } from './types';

export async function getToken(type: string = 'github'): Promise<TokenResult | null> {
  const strategy = strategies[type.toLowerCase()];
  
  if (!strategy) {
    throw new Error(`Unknown strategy: ${type}. Supported: ${Object.keys(strategies).join(', ')}`);
  }

  for (const tool of strategy.tools) {
    const result = await tool();
    if (result) return result;
  }

  return null;
}

export { strategies };
export * from './types';
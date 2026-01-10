import type { Tool, TokenValidator } from '../types';

export function createEnvHeuristicTool(
  validator: TokenValidator,
  ignoreKeys: string[] = []
): Tool {
  const ignoreSet = new Set(ignoreKeys);
  
  return async () => {
    for (const [key, val] of Object.entries(process.env)) {
      if (ignoreSet.has(key)) continue;
      if (typeof val === 'string' && validator(val)) {
        return { token: val.trim(), source: `Heuristic Scan (Found in ${key})` };
      }
    }
    return null;
  };
}

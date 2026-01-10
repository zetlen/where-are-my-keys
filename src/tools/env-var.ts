import type { Tool, TokenValidator } from '../types';

export function createEnvVarTool(keys: string[], validator: TokenValidator): Tool {
  return async () => {
    for (const key of keys) {
      const val = process.env[key];
      if (val && validator(val)) {
        return { token: val.trim(), source: `Environment Variable (${key})` };
      }
    }
    return null;
  };
}

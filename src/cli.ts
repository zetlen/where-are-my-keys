#!/usr/bin/env node
import { getToken, strategies } from './index';

(async () => {
  const mode = process.argv[2] || 'github';
  
  if (!strategies[mode]) {
    console.error(`❌ Invalid provider "${mode}". Try: ${Object.keys(strategies).join(', ')}`);
    process.exit(1);
  }

  console.log(`🔎 Running strategy: ${mode.toUpperCase()}`);
  try {
    const result = await getToken(mode);

    if (result && result.token) {
      console.log(`✅ Found via: ${result.source}`);
      const len = result.token.length;
      const start = result.token.substring(0, 4);
      const end = len > 8 ? result.token.substring(len - 4) : '';
      console.log(`🔑 Token: ${start}...${end}`);
    } else {
      console.error(`❌ No ${mode} credentials found.`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
})();

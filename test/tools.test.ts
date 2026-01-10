import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { createEnvVarTool } from '../src/tools/env-var';
import { createEnvHeuristicTool } from '../src/tools/env-heuristic';

describe('Tools', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  after(() => {
    process.env = originalEnv;
  });

  describe('EnvVarTool', () => {
    it('should find a valid token in environment variables', async () => {
      process.env.TEST_TOKEN = 'valid-token';
      const validator = (val: string) => val === 'valid-token';
      const tool = createEnvVarTool(['TEST_TOKEN'], validator);
      
      const result = await tool();
      assert.ok(result);
      assert.strictEqual(result.token, 'valid-token');
      assert.strictEqual(result.source, 'Environment Variable (TEST_TOKEN)');
    });

    it('should return null if key exists but invalid', async () => {
      process.env.TEST_TOKEN = 'invalid';
      const validator = (val: string) => val === 'valid';
      const tool = createEnvVarTool(['TEST_TOKEN'], validator);
      
      const result = await tool();
      assert.strictEqual(result, null);
    });

    it('should return null if key does not exist', async () => {
      const validator = (val: string) => true;
      const tool = createEnvVarTool(['NON_EXISTENT'], validator);
      
      const result = await tool();
      assert.strictEqual(result, null);
    });
  });

  describe('EnvHeuristicTool', () => {
    it('should find token by scanning environment', async () => {
      process.env.SOME_RANDOM_KEY = 'secret-value';
      const validator = (val: string) => val === 'secret-value';
      const tool = createEnvHeuristicTool(validator, []);
      
      const result = await tool();
      assert.ok(result);
      assert.strictEqual(result.token, 'secret-value');
      assert.strictEqual(result.source, 'Heuristic Scan (Found in SOME_RANDOM_KEY)');
    });

    it('should ignore specified keys', async () => {
      process.env.IGNORED_KEY = 'secret';
      const validator = (val: string) => val === 'secret';
      const tool = createEnvHeuristicTool(validator, ['IGNORED_KEY']);
      
      const result = await tool();
      assert.strictEqual(result, null);
    });
  });
});

import { githubStrategy } from './github';
import { npmStrategy } from './npm';
import { awsStrategy } from './aws';
import { gcpStrategy } from './gcp';
import { openaiStrategy } from './openai';
import type { Strategy } from '../types';

export const strategies: Record<string, Strategy> = {
  github: githubStrategy,
  npm: npmStrategy,
  aws: awsStrategy,
  gcp: gcpStrategy,
  openai: openaiStrategy
};

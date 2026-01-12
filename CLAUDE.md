# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Build with tsup (outputs to dist/)
npm run dev          # Build in watch mode
npm test             # Run all tests
npm run lint         # Check with Biome
npm run format       # Auto-fix with Biome
```

To run a single test file:
```bash
node --import tsx --test test/tools.test.ts
```

## Architecture

This is a credential discovery utility that finds auth tokens in the local environment. It does NOT extract or exfiltrate tokens - it only reports where they can be found.

### Core Pattern: Strategies + Tools

**Strategies** (`src/strategies/`) define how to find credentials for a specific provider (github, npm, aws, gcp). Each strategy contains an ordered list of **Tools** to try.

**Tools** (`src/tools/`) are reusable search mechanisms:
- `env-var.ts` - Check specific environment variables
- `env-heuristic.ts` - Scan all env vars with a validator function
- `shell.ts` - Run CLI commands (e.g., `gh auth token`)
- `file-probe.ts` - Search config files with regex patterns

Each tool is a factory function that returns an async `Tool` function. Tools return a `TokenResult` on success or `null` to try the next tool.

### Entry Point

`getToken(provider)` in `src/index.ts` runs the strategy's tools in order until one succeeds.

### Sensitive Environment Protection

When running in CI or production (`CI` env var set, or `NODE_ENV=production`), the tool confirms whether a secret exists but **refuses to reveal its location**. This prevents malicious workflows from exfiltrating credential locations.

Instead of location details, it returns a randomly-selected taunt mocking the would-be attacker. The taunts are intentionally sarcastic and dismissive - this is a feature, not a bug. When adding new taunts, match the existing tone: casual mockery, internet culture references, and security in-jokes are all fair game.

### Adding a New Provider

1. Create `src/strategies/newprovider.ts` with a `Strategy` object
2. Export and register it in `src/strategies/index.ts`

## Conventions

- Uses Biome for linting/formatting (tabs, double quotes)
- Conventional commits enforced via commitlint + lefthook
- Tests use Node.js built-in test runner with tsx
- ESM-first with dual CJS/ESM output

# Where Are My Keys?

ARE YOU TIRED of digging through your system trying to find that ONE API key you KNOW is there somewhere?! Have you ever spent TWENTY MINUTES grepping through dotfiles like some kind of ANIMAL?!

WELL STOP RIGHT THERE, FRIEND! **Where Are My Keys** is the INCREDIBLE utility that finds your auth tokens and API keys INSTANTLY! It searches your environment variables! It checks your CLI tools! It even digs through your config files! ALL WITH ONE SIMPLE COMMAND!

BUT WAIT, THERE'S MORE! It scans:
- Environment variables (known names AND smart heuristics!)
- Shell CLI tools (like `gh auth token` and `npm config get`!)
- Configuration files (`.env`, `.npmrc`, `.aws/credentials`, you name it!)

## Supported Providers

- **GitHub** (`github`): Checks `GITHUB_TOKEN`, `GH_TOKEN`, `gh` CLI, `.env`, etc.
- **NPM** (`npm`): Checks `NPM_TOKEN`, `NODE_AUTH_TOKEN`, `npm` CLI, `.npmrc`.
- **AWS** (`aws`): Checks `AWS_ACCESS_KEY_ID`, `aws` CLI, credentials file.
- **GCP** (`gcp`): Checks `GOOGLE_APPLICATION_CREDENTIALS`, `gcloud` CLI, key files.
- **OpenAI** (`openai`): Checks `OPENAI_API_KEY`, `.env` files.
- **Anthropic** (`anthropic`): Checks `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `.env` files.
- **Gemini** (`gemini`): Checks `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `.env` files.

## Installation

Requires Node.js 20 or later.

```bash
npm install -g where-are-my-keys
# or
npx where-are-my-keys [provider]
```

## Usage

### CLI

```bash
# Find GitHub token (default)
npx where-are-my-keys

# Find NPM token
npx where-are-my-keys npm

# Find OpenAI key
npx where-are-my-keys openai

# Find AWS keys
npx where-are-my-keys aws
```

### Programmatic Usage

```typescript
import { getToken } from 'where-are-my-keys';

const result = await getToken('github');

if (result) {
  console.log(`Token: ${result.token}`);
  console.log(`Source: ${result.source}`);
} else {
  console.log('No token found');
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## License

ISC

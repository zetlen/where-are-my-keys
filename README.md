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
# Find GitHub token
npx where-are-my-keys github

# Find NPM token
npx where-are-my-keys npm

# Find OpenAI key
npx where-are-my-keys openai

# Find AWS keys
npx where-are-my-keys aws

# Output as JSON (for scripting)
npx where-are-my-keys github --json
```

#### JSON Output

Use the `--json` flag to get machine-readable output:

```json
{
  "found": true,
  "provider": "github",
  "envVar": "GITHUB_TOKEN",
  "file": null,
  "command": null
}
```

### Programmatic Usage

```typescript
import { getToken } from 'where-are-my-keys';

const result = await getToken('github');

if (result) {
  console.log(`Found: ${result.message}`);
  if (result.envVar) console.log(`Variable: ${result.envVar}`);
  if (result.file) console.log(`File: ${result.file}`);
  if (result.command) console.log(`Command: ${result.command}`);
} else {
  console.log('No token found');
}
```

## TODO: Providers We'd Love to Add

**AI/ML Platforms:**
- Hugging Face (`HUGGINGFACE_TOKEN`, `HF_TOKEN`)
- Cohere (`COHERE_API_KEY`)
- Replicate (`REPLICATE_API_TOKEN`)
- Mistral (`MISTRAL_API_KEY`)
- Groq (`GROQ_API_KEY`)
- Together AI (`TOGETHER_API_KEY`)

**Cloud Providers:**
- Azure (`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `az` CLI)
- DigitalOcean (`DIGITALOCEAN_TOKEN`, `doctl` CLI)
- Cloudflare (`CLOUDFLARE_API_TOKEN`, `wrangler` CLI)
- Vercel (`VERCEL_TOKEN`, `vercel` CLI)
- Netlify (`NETLIFY_AUTH_TOKEN`, `netlify` CLI)

**Developer Tools:**
- Stripe (`STRIPE_SECRET_KEY`, `STRIPE_API_KEY`)
- Twilio (`TWILIO_AUTH_TOKEN`, `TWILIO_API_KEY`)
- SendGrid (`SENDGRID_API_KEY`)
- Slack (`SLACK_TOKEN`, `SLACK_BOT_TOKEN`)
- Discord (`DISCORD_TOKEN`, `DISCORD_BOT_TOKEN`)
- Linear (`LINEAR_API_KEY`)
- Sentry (`SENTRY_AUTH_TOKEN`, `sentry-cli`)
- Datadog (`DD_API_KEY`, `DATADOG_API_KEY`)

**Databases:**
- MongoDB Atlas (`MONGODB_URI`, `mongosh`)
- PlanetScale (`PLANETSCALE_TOKEN`, `pscale` CLI)
- Supabase (`SUPABASE_KEY`, `supabase` CLI)
- Neon (`NEON_API_KEY`, `neonctl`)
- Redis Cloud (`REDIS_URL`, `REDIS_PASSWORD`)
- Turso (`TURSO_AUTH_TOKEN`, `turso` CLI)

**Version Control & CI:**
- GitLab (`GITLAB_TOKEN`, `glab` CLI)
- Bitbucket (`BITBUCKET_TOKEN`)
- CircleCI (`CIRCLECI_TOKEN`, `circleci` CLI)

PRs welcome!

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

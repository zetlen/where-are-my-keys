# Where Are My Keys?

A utility for finding auth tokens and keys in your environment.

It scans:
- Environment variables (known names and heuristics)
- Shell CLI tools (e.g., `gh auth token`, `npm config get`)
- Configuration files (e.g., `.env`, `.npmrc`, `.aws/credentials`)

## Supported Providers

- **GitHub** (`github`): Checks `GITHUB_TOKEN`, `GH_TOKEN`, `gh` CLI, `.env`, etc.
- **NPM** (`npm`): Checks `NPM_TOKEN`, `NODE_AUTH_TOKEN`, `npm` CLI, `.npmrc`.
- **AWS** (`aws`): Checks `AWS_ACCESS_KEY_ID`, `aws` CLI, credentials file.
- **GCP** (`gcp`): Checks `GOOGLE_APPLICATION_CREDENTIALS`, `gcloud` CLI, key files.

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

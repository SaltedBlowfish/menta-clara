export interface BackupTemplate {
  label: string;
  code: string;
}

export const BACKUP_TEMPLATES: BackupTemplate[] = [
  {
    label: 'GitHub Gist',
    code: `// Back up all notes to a GitHub Gist.
// 1. Create a personal access token at https://github.com/settings/tokens
//    with the "gist" scope.
// 2. Replace YOUR_TOKEN below.
// 3. On first run this creates a new gist; after that it updates the same one.

const GITHUB_TOKEN = 'YOUR_TOKEN';
const GIST_ID = ''; // leave empty to create, or paste an existing gist ID

const files = {};

// Each note as a readable .md file
for (const note of payload.notes) {
  files[note.id + '.md'] = { content: note.markdown || '(empty)' };
}

// Full payload (JSON content, revision history, images) in one restorable file
files['_backup.json'] = { content: JSON.stringify(payload, null, 2) };

const body = JSON.stringify({
  description: 'Menta Clara backup — ' + payload.timestamp,
  public: false,
  files,
});

const url = GIST_ID
  ? 'https://api.github.com/gists/' + GIST_ID
  : 'https://api.github.com/gists';

const res = await fetch(url, {
  method: GIST_ID ? 'PATCH' : 'POST',
  headers: {
    Authorization: 'Bearer ' + GITHUB_TOKEN,
    'Content-Type': 'application/json',
  },
  body,
});

if (!res.ok) throw new Error('GitHub API ' + res.status + ': ' + (await res.text()));
console.log('Gist URL:', (await res.json()).html_url);`,
  },
  {
    label: 'Webhook (POST)',
    code: `// POST the full backup payload to a webhook URL.
// Replace the URL below with your endpoint.

const WEBHOOK_URL = 'https://example.com/webhook';

const res = await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (!res.ok) throw new Error('Webhook ' + res.status + ': ' + (await res.text()));
console.log('Webhook response:', res.status);`,
  },
];

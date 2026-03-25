export interface BackupTemplate {
  label: string;
  code: string;
}

export const BACKUP_TEMPLATES: BackupTemplate[] = [
  {
    label: 'GitHub Repo',
    code: `// Back up all notes + images to a GitHub repo as a single commit.
// Each backup creates a new commit with only the changed files (git diff).
// For large images, enable Git LFS on the repo:
//   git lfs install && git lfs track "images/*"
//
// 1. Create a repo (private recommended) and initialize it with a README.
// 2. Create a fine-grained token at https://github.com/settings/personal-access-tokens/new
//    with "Contents" read/write permission for that repo.
// 3. Fill in the values below.

const GITHUB_TOKEN = 'YOUR_TOKEN';
const OWNER = 'your-username';
const REPO = 'menta-clara-backup';
const BRANCH = 'main';

const api = async (path, opts = {}) => {
  const res = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + GITHUB_TOKEN,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error('GitHub ' + res.status + ': ' + (await res.text()));
  return res.json();
};

// Compute git blob SHA locally to detect what actually changed
async function gitSha(bytes) {
  const header = new TextEncoder().encode('blob ' + bytes.length + '\\0');
  const full = new Uint8Array(header.length + bytes.length);
  full.set(header);
  full.set(bytes, header.length);
  const hash = await crypto.subtle.digest('SHA-1', full);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function textSha(text) {
  return gitSha(new TextEncoder().encode(text));
}

async function base64Sha(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return gitSha(bytes);
}

// Fetch current tree to diff against
const ref = await api('/repos/' + OWNER + '/' + REPO + '/git/ref/heads/' + BRANCH);
const parentSha = ref.object.sha;
const parentCommit = await api('/repos/' + OWNER + '/' + REPO + '/git/commits/' + parentSha);
const currentTree = await api('/repos/' + OWNER + '/' + REPO + '/git/trees/' + parentCommit.tree.sha + '?recursive=1');
const existing = new Map(currentTree.tree.filter(f => f.type === 'blob').map(f => [f.path, f.sha]));

// Build list of changed files only
const tree = [];

for (const note of payload.notes) {
  const path = 'notes/' + note.id + '.md';
  const content = note.markdown || '(empty)';
  const sha = await textSha(content);
  if (existing.get(path) === sha) continue;
  const blob = await api('/repos/' + OWNER + '/' + REPO + '/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content, encoding: 'utf-8' }),
  });
  tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
}

const meta = { ...payload, images: payload.images.map(i => ({ id: i.id, mimeType: i.mimeType })) };
const metaContent = JSON.stringify(meta, null, 2);
const metaSha = await textSha(metaContent);
if (existing.get('_backup.json') !== metaSha) {
  const blob = await api('/repos/' + OWNER + '/' + REPO + '/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content: metaContent, encoding: 'utf-8' }),
  });
  tree.push({ path: '_backup.json', mode: '100644', type: 'blob', sha: blob.sha });
}

for (const img of payload.images) {
  const ext = img.mimeType.split('/')[1] || 'bin';
  const path = 'images/' + img.id + '.' + ext;
  const sha = await base64Sha(img.base64);
  if (existing.get(path) === sha) continue;
  const blob = await api('/repos/' + OWNER + '/' + REPO + '/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content: img.base64, encoding: 'base64' }),
  });
  tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
}

if (tree.length === 0) {
  console.log('Nothing changed, skipping commit.');
  return;
}

// Create tree and commit with only the changed files
const newTree = await api('/repos/' + OWNER + '/' + REPO + '/git/trees', {
  method: 'POST',
  body: JSON.stringify({ tree, base_tree: parentCommit.tree.sha }),
});

const commit = await api('/repos/' + OWNER + '/' + REPO + '/git/commits', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Backup ' + payload.timestamp + ' (' + tree.length + ' files changed)',
    tree: newTree.sha,
    parents: [parentSha],
  }),
});

await api('/repos/' + OWNER + '/' + REPO + '/git/refs/heads/' + BRANCH, {
  method: 'PATCH',
  body: JSON.stringify({ sha: commit.sha }),
});

console.log('Committed:', commit.sha, '(' + tree.length + ' files changed)');`,
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

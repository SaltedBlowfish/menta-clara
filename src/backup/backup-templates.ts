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
// 1. Create a repo (private recommended).
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

// Build file tree: notes as .md, full data as JSON, images as binary
const tree = [];

for (const note of payload.notes) {
  const blob = await api('/repos/' + OWNER + '/' + REPO + '/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content: note.markdown || '(empty)', encoding: 'utf-8' }),
  });
  tree.push({ path: 'notes/' + note.id + '.md', mode: '100644', type: 'blob', sha: blob.sha });
}

// Full restorable data (notes JSON + history, no images — those are committed separately)
const meta = { ...payload, images: payload.images.map(i => ({ id: i.id, mimeType: i.mimeType })) };
const metaBlob = await api('/repos/' + OWNER + '/' + REPO + '/git/blobs', {
  method: 'POST',
  body: JSON.stringify({ content: JSON.stringify(meta, null, 2), encoding: 'utf-8' }),
});
tree.push({ path: '_backup.json', mode: '100644', type: 'blob', sha: metaBlob.sha });

// Images as binary blobs (base64-encoded in the API, stored as binary in the repo)
for (const img of payload.images) {
  const ext = img.mimeType.split('/')[1] || 'bin';
  const blob = await api('/repos/' + OWNER + '/' + REPO + '/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content: img.base64, encoding: 'base64' }),
  });
  tree.push({ path: 'images/' + img.id + '.' + ext, mode: '100644', type: 'blob', sha: blob.sha });
}

// Get current commit to base the new tree on
let parentSha;
try {
  const ref = await api('/repos/' + OWNER + '/' + REPO + '/git/ref/heads/' + BRANCH);
  parentSha = ref.object.sha;
} catch {
  // Empty repo — no parent
}

// Create tree and commit
const newTree = await api('/repos/' + OWNER + '/' + REPO + '/git/trees', {
  method: 'POST',
  body: JSON.stringify({ tree, base_tree: parentSha ? (await api('/repos/' + OWNER + '/' + REPO + '/git/commits/' + parentSha)).tree.sha : undefined }),
});

const commitBody = { message: 'Backup ' + payload.timestamp + ' (' + payload.meta.noteCount + ' notes, ' + payload.meta.imageCount + ' images)', tree: newTree.sha };
if (parentSha) commitBody.parents = [parentSha];

const commit = await api('/repos/' + OWNER + '/' + REPO + '/git/commits', {
  method: 'POST',
  body: JSON.stringify(commitBody),
});

// Update (or create) branch ref
if (parentSha) {
  await api('/repos/' + OWNER + '/' + REPO + '/git/refs/heads/' + BRANCH, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
} else {
  await api('/repos/' + OWNER + '/' + REPO + '/git/refs', {
    method: 'POST',
    body: JSON.stringify({ ref: 'refs/heads/' + BRANCH, sha: commit.sha }),
  });
}

console.log('Committed:', commit.sha);`,
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

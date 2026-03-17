import { getDatabase, IMAGES_STORE } from '../storage/database';

export interface StoredImage {
  blob: Blob;
  id: string;
  mimeType: string;
  updatedAt: number;
}

function isStoredImage(value: unknown): value is StoredImage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'blob' in value &&
    'id' in value &&
    'mimeType' in value
  );
}

export async function storeImage(
  blob: Blob,
  mimeType: string,
): Promise<string> {
  const id = `img:${crypto.randomUUID()}`;
  const db = await getDatabase();
  await db.put(IMAGES_STORE, { blob, id, mimeType, updatedAt: Date.now() });
  return id;
}

export async function loadImage(imageId: string): Promise<string | null> {
  const db = await getDatabase();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- IndexedDB returns unknown
  const record = await db.get(IMAGES_STORE, imageId);
  if (!isStoredImage(record)) return null;
  return URL.createObjectURL(record.blob);
}

export async function deleteImage(imageId: string): Promise<void> {
  const db = await getDatabase();
  await db.delete(IMAGES_STORE, imageId);
}

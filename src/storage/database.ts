import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'paneful-notes';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

export type PanefulDB = IDBPDatabase;

export const NOTES_STORE = STORE_NAME;

export async function getDatabase(): Promise<PanefulDB> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

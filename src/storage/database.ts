import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'paneful-notes';
const DB_VERSION = 3;
const NOTES_STORE_NAME = 'notes';
const IMAGES_STORE_NAME = 'images';
const HISTORY_STORE_NAME = 'history';

export type PanefulDB = IDBPDatabase;

export const HISTORY_STORE = HISTORY_STORE_NAME;
export const IMAGES_STORE = IMAGES_STORE_NAME;
export const NOTES_STORE = NOTES_STORE_NAME;

export async function getDatabase(): Promise<PanefulDB> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore(IMAGES_STORE_NAME, { keyPath: 'id' });
      }
      if (oldVersion < 3) {
        const store = db.createObjectStore(HISTORY_STORE_NAME, {
          autoIncrement: true,
          keyPath: 'id',
        });
        store.createIndex('noteId', 'noteId', { unique: false });
        store.createIndex('noteId_timestamp', ['noteId', 'timestamp']);
      }
    },
  });
}

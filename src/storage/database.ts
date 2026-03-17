import { type IDBPDatabase, openDB } from 'idb';

const DB_NAME = 'paneful-notes';
const DB_VERSION = 2;
const NOTES_STORE_NAME = 'notes';
const IMAGES_STORE_NAME = 'images';

export type PanefulDB = IDBPDatabase;

export const NOTES_STORE = NOTES_STORE_NAME;
export const IMAGES_STORE = IMAGES_STORE_NAME;

export async function getDatabase(): Promise<PanefulDB> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore(IMAGES_STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

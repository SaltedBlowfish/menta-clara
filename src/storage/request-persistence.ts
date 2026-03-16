export type PersistenceResult = 'denied' | 'granted' | 'unavailable';

export async function requestPersistence(): Promise<PersistenceResult> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime feature detection
  if (!navigator.storage?.persist) {
    return 'unavailable';
  }

  const granted = await navigator.storage.persist();

  if (granted) {
    console.info('Persistent storage: granted');
    return 'granted';
  }

  console.info('Persistent storage: denied');
  return 'denied';
}

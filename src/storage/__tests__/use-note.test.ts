import { act, renderHook } from '@testing-library/react';

import * as dbCache from '../db-cache';
import { useNote } from '../use-note';

// In-memory backing store for the cache mock
const store = new Map<string, unknown>();
const subscribers = new Set<() => void>();

function notify() {
  for (const cb of subscribers) cb();
}

vi.mock('../db-cache', () => ({
  deleteRecord: vi.fn((key: string) => {
    store.set(key, null);
    notify();
  }),
  getRecord: vi.fn((key: string) => store.get(key)),
  hasRecord: vi.fn((key: string) => store.has(key)),
  putRecord: vi.fn((value: { id: string }) => {
    store.set(value.id, value);
    notify();
  }),
  requestLoad: vi.fn((key: string) => {
    // Simulate async load completing synchronously for tests
    if (!store.has(key)) {
      store.set(key, null);
      // Notify on next microtask to simulate async
      void Promise.resolve().then(notify);
    }
  }),
  subscribe: vi.fn((cb: () => void) => {
    subscribers.add(cb);
    return () => { subscribers.delete(cb); };
  }),
}));

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

const NON_EMPTY_CONTENT = {
  content: [{ content: [{ text: 'hello', type: 'text' }], type: 'paragraph' }],
  type: 'doc',
};

const EMPTY_CONTENT = {
  content: [{ type: 'paragraph' }],
  type: 'doc',
};

beforeEach(() => {
  store.clear();
  subscribers.clear();
  vi.clearAllMocks();
});

describe('useNote', () => {
  it('triggers requestLoad and resolves to not loading', async () => {
    const { result } = renderHook(() => useNote());
    await flush();
    expect(result.current.loading).toBe(false);
    expect(dbCache.requestLoad).toHaveBeenCalledWith('current');
  });

  it('returns null content for missing note', async () => {
    const { result } = renderHook(() => useNote());
    await flush();
    expect(result.current.content).toBeNull();
  });

  it('loads existing note from database', () => {
    store.set('current', {
      content: NON_EMPTY_CONTENT,
      id: 'current',
      updatedAt: 1000,
    });
    const { result } = renderHook(() => useNote());
    expect(result.current.content).toEqual(NON_EMPTY_CONTENT);
  });

  it('saves content via putRecord on saveContent call', async () => {
    const { result } = renderHook(() => useNote());
    await flush();

    act(() => { result.current.saveContent(NON_EMPTY_CONTENT); });

    expect(dbCache.putRecord).toHaveBeenCalledWith(expect.objectContaining({
      content: NON_EMPTY_CONTENT,
      id: 'current',
    }));
  });

  it('deletes note when content is empty', async () => {
    store.set('current', {
      content: NON_EMPTY_CONTENT,
      id: 'current',
      updatedAt: 1000,
    });
    const { result } = renderHook(() => useNote());
    await flush();

    act(() => { result.current.saveContent(EMPTY_CONTENT); });

    expect(dbCache.deleteRecord).toHaveBeenCalledWith('current');
  });
});

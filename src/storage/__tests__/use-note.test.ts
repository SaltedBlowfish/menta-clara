import { act, renderHook } from '@testing-library/react';

import { useNote } from '../use-note';

vi.mock('../database', () => {
  const store = new Map<string, unknown>();
  return {
    getDatabase: vi.fn().mockResolvedValue({
      get: vi.fn((storeName: string, key: string) =>
        Promise.resolve(store.get(`${storeName}:${key}`)),
      ),
      put: vi.fn((storeName: string, value: { id: string }) => {
        store.set(`${storeName}:${value.id}`, value);
        return Promise.resolve();
      }),
    }),
    NOTES_STORE: 'notes',
    resetStore: () => store.clear(),
  };
});

beforeEach(() => {
  vi.useFakeTimers();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { resetStore } = vi.mocked(require('../database'));
  resetStore();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useNote', () => {
  it('returns loading true initially then resolves', async () => {
    const { result } = renderHook(() => useNote());
    expect(result.current.loading).toBe(true);
    await act(async () => { /* let mount effect resolve */ });
    expect(result.current.loading).toBe(false);
  });

  it('returns null content for missing note', async () => {
    const { result } = renderHook(() => useNote());
    await act(async () => { /* resolve */ });
    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads existing note from database', async () => {
    const { getDatabase } = await import('../database');
    const db = await getDatabase();
    await db.put('notes', {
      content: { content: [], type: 'doc' },
      id: 'current',
      updatedAt: 1000,
    });

    const { result } = renderHook(() => useNote());
    await act(async () => { /* resolve */ });
    expect(result.current.content).toEqual({ content: [], type: 'doc' });
  });

  it('debounces saveContent writes', async () => {
    const { getDatabase } = await import('../database');
    const { result } = renderHook(() => useNote());
    await act(async () => { /* resolve */ });

    act(() => {
      result.current.saveContent({ content: [], type: 'doc' });
    });

    const db = await getDatabase();
    expect(db.put).not.toHaveBeenCalled();

    await act(async () => { vi.advanceTimersByTime(300); });
    expect(db.put).toHaveBeenCalledWith('notes', expect.objectContaining({
      content: { content: [], type: 'doc' },
      id: 'current',
    }));
  });

  it('sets error state on write failure', async () => {
    const { getDatabase } = await import('../database');
    const db = await getDatabase();
    vi.mocked(db.put).mockRejectedValueOnce(new Error('quota'));

    const { result } = renderHook(() => useNote());
    await act(async () => { /* resolve */ });

    act(() => {
      result.current.saveContent({ content: [], type: 'doc' });
    });

    await act(async () => { vi.advanceTimersByTime(300); });
    expect(result.current.error).toBe(
      'Could not save your note. Check that your browser has available storage space.',
    );
  });
});

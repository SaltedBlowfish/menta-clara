import { act, renderHook } from '@testing-library/react';

import { getDatabase } from '../database';
import { useNote } from '../use-note';

const store = new Map<string, unknown>();

vi.mock('../database', () => ({
  getDatabase: vi.fn().mockResolvedValue({
    get: vi.fn((_store: string, key: string) =>
      Promise.resolve(store.get(key)),
    ),
    put: vi.fn((_store: string, value: { id: string }) => {
      store.set(value.id, value);
      return Promise.resolve();
    }),
  }),
  NOTES_STORE: 'notes',
}));

async function tick() {
  await act(() => Promise.resolve());
}

async function advanceTimers(ms: number) {
  await act(() => {
    vi.advanceTimersByTime(ms);
    return Promise.resolve();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  store.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useNote', () => {
  it('returns loading true then resolves to false', async () => {
    const { result } = renderHook(() => useNote());
    expect(result.current.loading).toBe(true);
    await tick();
    expect(result.current.loading).toBe(false);
  });

  it('returns null content for missing note', async () => {
    const { result } = renderHook(() => useNote());
    await tick();
    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads existing note from database', async () => {
    store.set('current', {
      content: { content: [], type: 'doc' },
      id: 'current',
      updatedAt: 1000,
    });
    const { result } = renderHook(() => useNote());
    await tick();
    expect(result.current.content).toEqual({ content: [], type: 'doc' });
  });

  it('debounces saveContent writes', async () => {
    const db = vi.mocked(await getDatabase());
    const { result } = renderHook(() => useNote());
    await tick();
    db.put.mockClear();

    act(() => { result.current.saveContent({ content: [], type: 'doc' }); });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(db.put).not.toHaveBeenCalled();

    await advanceTimers(300);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(db.put).toHaveBeenCalledWith('notes', expect.objectContaining({
      content: { content: [], type: 'doc' },
      id: 'current',
    }));
  });

  it('sets error state on write failure', async () => {
    const db = vi.mocked(await getDatabase());
    db.put.mockRejectedValueOnce(new Error('quota'));

    const { result } = renderHook(() => useNote());
    await tick();

    act(() => { result.current.saveContent({ content: [], type: 'doc' }); });
    await advanceTimers(300);

    expect(result.current.error).toBe(
      'Could not save your note. Check that your browser has available storage space.',
    );
  });
});

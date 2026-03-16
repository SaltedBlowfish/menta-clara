import { requestPersistence } from '../request-persistence';

const mockPersist = vi.fn<() => Promise<boolean>>();

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  Object.defineProperty(navigator, 'storage', {
    configurable: true,
    value: { persist: mockPersist },
    writable: true,
  });
});

describe('requestPersistence', () => {
  it('calls navigator.storage.persist()', async () => {
    mockPersist.mockResolvedValue(true);
    await requestPersistence();
    expect(mockPersist).toHaveBeenCalledOnce();
  });

  it('returns granted when persist() resolves true', async () => {
    mockPersist.mockResolvedValue(true);
    const result = await requestPersistence();
    expect(result).toBe('granted');
    expect(console.info).toHaveBeenCalledWith('Persistent storage: granted');
  });

  it('returns denied when persist() resolves false', async () => {
    mockPersist.mockResolvedValue(false);
    const result = await requestPersistence();
    expect(result).toBe('denied');
    expect(console.info).toHaveBeenCalledWith('Persistent storage: denied');
  });

  it('returns unavailable when navigator.storage is undefined', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    const result = await requestPersistence();
    expect(result).toBe('unavailable');
  });
});

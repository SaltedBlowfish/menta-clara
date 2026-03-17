import type { JSONContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

import { render, screen } from '@testing-library/react';

import { NoteEditor } from '../editor';

vi.mock('@tiptap/react', async () => {
  const actual = await vi.importActual<typeof import('@tiptap/react')>(
    '@tiptap/react',
  );
  return {
    ...actual,
    EditorContent: ({ editor }: { editor: unknown }) =>
      editor ? <div data-testid="editor-content">Editor</div> : null,
  };
});

vi.mock('../use-editor-config', () => ({
  useEditorConfig: vi.fn<() => Editor | null>(),
}));

const { useEditorConfig } = await import('../use-editor-config');
const mockUseEditorConfig = vi.mocked(useEditorConfig);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NoteEditor', () => {
  it('renders null when editor is not ready', () => {
    mockUseEditorConfig.mockReturnValue(null);
    const { container } = render(
      <NoteEditor content={null} onUpdate={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders EditorContent when editor is ready', () => {
    const chainable = new Proxy({} as Record<string, unknown>, {
      get: (_, prop) => prop === 'run' ? vi.fn() : () => chainable,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- mock editor for render test
    mockUseEditorConfig.mockReturnValue({
      chain: () => chainable,
      isActive: () => false,
    } as never);
    render(<NoteEditor content={null} onUpdate={vi.fn()} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('passes content and onUpdate to useEditorConfig', () => {
    mockUseEditorConfig.mockReturnValue(null);
    const content: JSONContent = { content: [], type: 'doc' };
    const onUpdate = vi.fn();
    render(<NoteEditor content={content} onUpdate={onUpdate} />);
    expect(mockUseEditorConfig).toHaveBeenCalledWith({ content, onUpdate });
  });
});

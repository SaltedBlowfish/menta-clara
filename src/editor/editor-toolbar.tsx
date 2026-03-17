import type { Editor } from '@tiptap/react';

import { Tooltip } from '../shared/tooltip';
import './editor-toolbar.css';

function Btn(props: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip label={props.label}>
      <button
        className={props.active ? 'is-active' : undefined}
        onClick={props.onClick}
        onMouseDown={(e) => { e.preventDefault(); }}
        type="button"
      >
        {props.children}
      </button>
    </Tooltip>
  );
}

function run(editor: Editor, fn: (e: Editor) => void) {
  return () => { fn(editor); };
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="editor-toolbar">
      <Btn active={editor.isActive('heading', { level: 1 })} label="Heading 1" onClick={run(editor, (e) => e.chain().focus().toggleHeading({ level: 1 }).run())}>H1</Btn>
      <Btn active={editor.isActive('heading', { level: 2 })} label="Heading 2" onClick={run(editor, (e) => e.chain().focus().toggleHeading({ level: 2 }).run())}>H2</Btn>
      <Btn active={editor.isActive('heading', { level: 3 })} label="Heading 3" onClick={run(editor, (e) => e.chain().focus().toggleHeading({ level: 3 }).run())}>H3</Btn>
      <div className="editor-toolbar-divider" />
      <Btn active={editor.isActive('bold')} label="Bold" onClick={run(editor, (e) => e.chain().focus().toggleBold().run())}><strong>B</strong></Btn>
      <Btn active={editor.isActive('italic')} label="Italic" onClick={run(editor, (e) => e.chain().focus().toggleItalic().run())}><em>I</em></Btn>
      <Btn active={editor.isActive('strike')} label="Strikethrough" onClick={run(editor, (e) => e.chain().focus().toggleStrike().run())}><s>S</s></Btn>
      <Btn active={editor.isActive('code')} label="Inline code" onClick={run(editor, (e) => e.chain().focus().toggleCode().run())}>{'</>'}</Btn>
      <div className="editor-toolbar-divider" />
      <Btn active={editor.isActive('bulletList')} label="Bullet list" onClick={run(editor, (e) => e.chain().focus().toggleBulletList().run())}>&#8226;</Btn>
      <Btn active={editor.isActive('orderedList')} label="Numbered list" onClick={run(editor, (e) => e.chain().focus().toggleOrderedList().run())}>1.</Btn>
      <Btn active={editor.isActive('blockquote')} label="Blockquote" onClick={run(editor, (e) => e.chain().focus().toggleBlockquote().run())}>&ldquo;</Btn>
      <Btn active={editor.isActive('codeBlock')} label="Code block" onClick={run(editor, (e) => e.chain().focus().toggleCodeBlock().run())}>{'{ }'}</Btn>
      <div className="editor-toolbar-divider" />
      <Btn active={false} label="Horizontal rule" onClick={run(editor, (e) => e.chain().focus().setHorizontalRule().run())}>&#8213;</Btn>
    </div>
  );
}

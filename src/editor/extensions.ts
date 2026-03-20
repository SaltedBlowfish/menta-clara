import type { Extensions } from '@tiptap/react';
import type { Doc as YDoc } from 'yjs';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import Link from '@tiptap/extension-link';
import ListKeymap from '@tiptap/extension-list-keymap';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';

import './date-reference.css';
import { DateReference } from './date-reference';
import { ImageWithPaste } from './image-paste';
import { TabKeymap } from './tab-keymap';

const lowlight = createLowlight(common);

const baseExtensions = [
  CodeBlockLowlight.configure({ lowlight }),
  ImageWithPaste.configure({ inline: false }),
  Link.configure({ autolink: true, openOnClick: true }),
  ListKeymap,
  TabKeymap,
  DateReference,
];

function starterKit(collab: boolean) {
  return collab
    ? StarterKit.configure({ codeBlock: false, link: false, listKeymap: false, undoRedo: false })
    : StarterKit.configure({ codeBlock: false, link: false, listKeymap: false });
}

export function createExtensions(ydoc: YDoc | null, field: string): Extensions {
  return [
    starterKit(!!ydoc),
    ...baseExtensions,
    ...(ydoc ? [Collaboration.configure({ document: ydoc, field })] : []),
  ];
}

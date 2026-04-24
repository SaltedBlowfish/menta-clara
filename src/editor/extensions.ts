import type { Extensions } from '@tiptap/react';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import ListKeymap from '@tiptap/extension-list-keymap';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';

import './date-reference.css';
import { DateReference } from './date-reference';
import { ImageWithPaste } from './image-paste';
import { TabKeymap } from './tab-keymap';

const lowlight = createLowlight(common);

export function createExtensions(): Extensions {
  return [
    StarterKit.configure({ codeBlock: false, link: false, listKeymap: false }),
    CodeBlockLowlight.configure({ lowlight }),
    ImageWithPaste.configure({ inline: false }),
    Link.configure({ autolink: true, openOnClick: true }),
    ListKeymap,
    TabKeymap,
    DateReference,
  ];
}

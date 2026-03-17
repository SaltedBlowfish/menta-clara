import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import ListKeymap from '@tiptap/extension-list-keymap';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';

import './date-reference.css';
import { DateReference } from './date-reference';
import { ImageWithPaste } from './image-paste';

const lowlight = createLowlight(common);

export const editorExtensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }),
  ImageWithPaste.configure({
    inline: false,
  }),
  Link.configure({
    autolink: true,
    openOnClick: true,
  }),
  ListKeymap,
  DateReference,
];

import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { format, isValid, parseISO } from 'date-fns';

const DATE_REFERENCE_REGEX = /\[\[(\d{4}-\d{2}-\d{2})\]\]$/;

export const DateReference = Node.create({
  name: 'dateReference',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return { date: { default: null } };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: DATE_REFERENCE_REGEX,
        getAttributes: (match) => {
          const dateStr = match[1];
          if (!dateStr || !isValid(parseISO(dateStr))) return false;
          return { date: dateStr };
        },
        type: this.type,
      }),
    ];
  },

  parseHTML() {
    return [{ tag: 'a[data-date-ref]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const dateStr = node.attrs.date as string;
    const parsed = parseISO(dateStr);
    const display = isValid(parsed) ? format(parsed, 'MMMM d, yyyy') : dateStr;
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'aria-label': `Go to ${display}`,
        class: 'date-reference',
        'data-date-ref': dateStr,
        href: '#',
      }),
      display,
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dateReferenceClick'),
        props: {
          handleClick: (_view, _pos, event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return false;
            const dateRef = target.closest<HTMLElement>('[data-date-ref]');
            if (!dateRef) return false;
            const dateStr = dateRef.getAttribute('data-date-ref');
            if (!dateStr) return false;
            event.preventDefault();
            window.dispatchEvent(
              new CustomEvent('date-reference-click', { detail: dateStr }),
            );
            return true;
          },
        },
      }),
    ];
  },
});

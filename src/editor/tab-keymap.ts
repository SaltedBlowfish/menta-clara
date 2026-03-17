import { Extension } from '@tiptap/core';

export const TabKeymap = Extension.create({
  name: 'tabKeymap',

  addKeyboardShortcuts() {
    return {
      'Shift-Tab': () => {
        // In a list, lift the item. Otherwise just trap the key.
        if (this.editor.can().liftListItem('listItem')) {
          return this.editor.commands.liftListItem('listItem');
        }
        return true;
      },
      Tab: () => {
        // In a list, sink the item. Otherwise just trap the key.
        if (this.editor.can().sinkListItem('listItem')) {
          return this.editor.commands.sinkListItem('listItem');
        }
        return true;
      },
    };
  },
});

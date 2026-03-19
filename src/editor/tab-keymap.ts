import type { Editor } from '@tiptap/core';

import { Extension } from '@tiptap/core';

function trySink(editor: Editor): boolean {
  if (editor.can().sinkListItem('listItem')) {
    return editor.commands.sinkListItem('listItem');
  }
  return true;
}

function tryLift(editor: Editor): boolean {
  if (editor.can().liftListItem('listItem')) {
    return editor.commands.liftListItem('listItem');
  }
  return true;
}

export const TabKeymap = Extension.create({
  name: 'tabKeymap',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      'Shift-Tab': () => tryLift(this.editor),
      Tab: () => trySink(this.editor),
    };
  },
});

import type { JSONContent } from '@tiptap/react';
import { useMemo } from 'react';

import type { PaletteCommand } from '../command-palette/command-registry';
import type { Template } from './use-templates';

interface UseTemplateCommandsOptions {
  announce: (msg: string) => void;
  currentContent: JSONContent | null;
  deleteTemplate: (id: string) => void;
  renameTemplate: (id: string, name: string) => void;
  saveTemplate: (name: string, content: JSONContent) => string;
  setDefault: (slot: 'weekday' | 'weekend' | 'weekly', id: string | null) => void;
  templates: ReadonlyArray<Template>;
}

function pickTemplate(templates: ReadonlyArray<Template>, action: string): Template | null {
  if (templates.length === 0) return null;
  const list = templates.map((t, i) => `${String(i + 1)}. ${t.name}`).join('\n');
  const input = window.prompt(`${action}:\n${list}`);
  if (!input) return null;
  const idx = parseInt(input, 10) - 1;
  return templates[idx] ?? null;
}

export function useTemplateCommands(options: UseTemplateCommandsOptions): ReadonlyArray<PaletteCommand> {
  const { announce, currentContent, deleteTemplate, renameTemplate, saveTemplate, setDefault, templates } = options;

  return useMemo((): ReadonlyArray<PaletteCommand> => {
    const cmds: PaletteCommand[] = [
      {
        action: () => {
          if (!currentContent) return;
          const name = window.prompt('Template name:');
          if (!name) return;
          saveTemplate(name, currentContent);
          announce(`Template ${name} saved`);
        },
        id: 'tmpl-save', keywords: ['save', 'template', 'create'], name: 'Save as Template',
      },
      {
        action: () => {
          const t = pickTemplate(templates, 'Set weekday template');
          if (t) { setDefault('weekday', t.id); announce(`Weekday template set to ${t.name}`); }
        },
        id: 'tmpl-weekday', keywords: ['weekday', 'default', 'template'], name: 'Set Weekday Template',
      },
      {
        action: () => {
          const t = pickTemplate(templates, 'Set weekend template');
          if (t) { setDefault('weekend', t.id); announce(`Weekend template set to ${t.name}`); }
        },
        id: 'tmpl-weekend', keywords: ['weekend', 'default', 'template'], name: 'Set Weekend Template',
      },
      {
        action: () => {
          const t = pickTemplate(templates, 'Set weekly template');
          if (t) { setDefault('weekly', t.id); announce(`Weekly template set to ${t.name}`); }
        },
        id: 'tmpl-weekly', keywords: ['weekly', 'default', 'template'], name: 'Set Weekly Template',
      },
      {
        action: () => {
          const t = pickTemplate(templates, 'Delete template');
          if (!t) return;
          if (window.confirm(`Delete template "${t.name}"?`)) {
            deleteTemplate(t.id);
            announce(`Template ${t.name} deleted`);
          }
        },
        id: 'tmpl-delete', keywords: ['delete', 'template', 'remove'], name: 'Delete Template',
      },
      {
        action: () => {
          const t = pickTemplate(templates, 'Rename template');
          if (!t) return;
          const newName = window.prompt('New name:', t.name);
          if (newName) { renameTemplate(t.id, newName); announce(`Template renamed to ${newName}`); }
        },
        id: 'tmpl-rename', keywords: ['rename', 'template'], name: 'Rename Template',
      },
    ];
    return cmds;
  }, [announce, currentContent, deleteTemplate, renameTemplate, saveTemplate, setDefault, templates]);
}

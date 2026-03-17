import type { JSONContent } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { getDatabase, NOTES_STORE } from '../storage/database';

export interface Template {
  content: JSONContent;
  id: string;
  name: string;
}

export interface TemplateDefaults {
  weekday: string | null;
  weekend: string | null;
  weekly: string | null;
}

function isTemplateRecord(v: unknown): v is Template & { updatedAt: number } {
  return typeof v === 'object' && v !== null && 'id' in v && 'content' in v && 'name' in v;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<ReadonlyArray<Template>>([]);
  const [defaults, setDefaults] = usePersistedState<TemplateDefaults>(
    'setting:templateDefaults',
    { weekday: null, weekend: null, weekly: null },
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const db = await getDatabase();
      const records: unknown[] = await db.getAll(NOTES_STORE, IDBKeyRange.bound('template:', 'template:\uffff'));
      if (!cancelled) {
        setTemplates(records.filter(isTemplateRecord).map((r) => ({ content: r.content, id: r.id, name: r.name })));
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const saveTemplate = useCallback((name: string, content: JSONContent): string => {
    const id = `template:${crypto.randomUUID()}`;
    void (async () => {
      const db = await getDatabase();
      await db.put(NOTES_STORE, { content, id, name, updatedAt: Date.now() });
    })();
    setTemplates((prev) => [...prev, { content, id, name }]);
    return id;
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    void (async () => {
      const db = await getDatabase();
      await db.delete(NOTES_STORE, templateId);
    })();
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    setDefaults({
      weekday: defaults.weekday === templateId ? null : defaults.weekday,
      weekend: defaults.weekend === templateId ? null : defaults.weekend,
      weekly: defaults.weekly === templateId ? null : defaults.weekly,
    });
  }, [defaults, setDefaults]);

  const renameTemplate = useCallback((templateId: string, newName: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, name: newName } : t)));
    void (async () => {
      const db = await getDatabase();
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- reading back DB record
      const rec = (await db.get(NOTES_STORE, templateId)) as (Template & { updatedAt: number }) | undefined;
      if (rec) await db.put(NOTES_STORE, { ...rec, name: newName, updatedAt: Date.now() });
    })();
  }, []);

  const getTemplateContent = useCallback(
    (templateId: string): JSONContent | null => templates.find((t) => t.id === templateId)?.content ?? null,
    [templates],
  );

  const setDefault = useCallback(
    (slot: 'weekday' | 'weekend' | 'weekly', templateId: string | null) => {
      setDefaults({ ...defaults, [slot]: templateId });
    },
    [defaults, setDefaults],
  );

  return { defaults, deleteTemplate, getTemplateContent, renameTemplate, saveTemplate, setDefault, templates };
}

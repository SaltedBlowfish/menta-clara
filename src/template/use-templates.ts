import type { JSONContent } from '@tiptap/react';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { usePersistedState } from '../shared/use-persisted-state';
import { deleteRecord, getRecord, getRangeRecords, hasRecord, putRecord, requestLoad, requestRangeLoad, subscribe } from '../storage/db-cache';

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

const RANGE_PREFIX = 'template:';

export function useTemplates() {
  const [defaults, setDefaults] = usePersistedState<TemplateDefaults>(
    'setting:templateDefaults',
    { weekday: null, weekend: null, weekly: null },
  );

  const rangeRecords = useSyncExternalStore(subscribe, () => getRangeRecords(RANGE_PREFIX));
  if (rangeRecords === undefined) {
    requestRangeLoad(RANGE_PREFIX);
  }

  const templates = useMemo<ReadonlyArray<Template>>(() => {
    if (!rangeRecords) return [];
    return rangeRecords
      .filter(isTemplateRecord)
      .map((r) => ({ content: r.content, id: r.id, name: r.name }));
  }, [rangeRecords]);

  const saveTemplate = useCallback((name: string, content: JSONContent): string => {
    const id = `template:${crypto.randomUUID()}`;
    putRecord({ content, id, name, updatedAt: Date.now() });
    return id;
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    deleteRecord(templateId);
    setDefaults({
      weekday: defaults.weekday === templateId ? null : defaults.weekday,
      weekend: defaults.weekend === templateId ? null : defaults.weekend,
      weekly: defaults.weekly === templateId ? null : defaults.weekly,
    });
  }, [defaults, setDefaults]);

  const renameTemplate = useCallback((templateId: string, newName: string) => {
    // Read current record from cache to preserve content
    const raw = hasRecord(templateId) ? getRecord(templateId) : null;
    if (isTemplateRecord(raw)) {
      putRecord({ ...raw, name: newName, updatedAt: Date.now() });
    } else {
      // Not in cache yet — load then rename
      requestLoad(templateId);
    }
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

import { Doc as YDoc } from 'yjs';

let workspaceDoc: YDoc | null = null;

export function getWorkspaceDoc(): YDoc {
  if (!workspaceDoc) {
    workspaceDoc = new YDoc();
  }
  return workspaceDoc;
}

export function destroyWorkspaceDoc(): void {
  workspaceDoc?.destroy();
  workspaceDoc = null;
}

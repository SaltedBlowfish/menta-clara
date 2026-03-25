import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

import { loadImage, storeImage } from '../image/use-image-store';

// Track which image IDs have already been resolved to avoid duplicate work
const resolved = new Set<string>();

function resolveImages(view: EditorView) {
  const { doc, tr } = view.state;
  let changed = false;

  doc.descendants((node, pos) => {
    if (node.type.name !== 'image') return;
    const imageId = node.attrs['data-image-id'] as string | null;
    const src = node.attrs.src as string;
    if (!imageId || resolved.has(imageId)) return;
    if (src && !src.startsWith('blob:')) return;
    if (src && src.startsWith('blob:')) {
      // Check if blob URL is still valid
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', src, false);
        xhr.send();
        if (xhr.status === 200) {
          resolved.add(imageId);
          return;
        }
      } catch {
        // blob URL is dead, resolve from DB
      }
    }
    resolved.add(imageId);
    void loadImage(imageId).then((url) => {
      if (!url) return;
      view.dispatch(
        view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: url }),
      );
    });
  });

  if (changed) view.dispatch(tr);
}

export const ImageWithPaste = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-image-id': { default: null },
    };
  },

  addProseMirrorPlugins() {
    const imageType = this.type;
    return [
      new Plugin({
        key: new PluginKey('imagePaste'),
        props: {
          handlePaste: (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of Array.from(items) as DataTransferItem[]) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;
                const mimeType = item.type;
                event.preventDefault();

                void (async () => {
                  const imageId = await storeImage(file, mimeType);
                  const url = URL.createObjectURL(file);
                  resolved.add(imageId);
                  const node = imageType.create({
                    'data-image-id': imageId,
                    src: url,
                  });
                  const tr = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(tr);
                })();

                return true;
              }
            }
            return false;
          },
        },
      }),
      new Plugin({
        key: new PluginKey('imageResolve'),
        view(editorView) {
          resolveImages(editorView);
          return {
            update(view) {
              resolveImages(view);
            },
          };
        },
      }),
    ];
  },
});

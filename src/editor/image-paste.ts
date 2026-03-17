import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { storeImage } from '../image/use-image-store';

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

            for (const item of Array.from(items)) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;
                event.preventDefault();

                void (async () => {
                  const imageId = await storeImage(file, item.type);
                  const url = URL.createObjectURL(file);
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
    ];
  },
});

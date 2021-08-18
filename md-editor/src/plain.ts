import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  editorViewCtx,
  serializerCtx
} from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { clipboard } from '@milkdown/plugin-clipboard';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';
import { emoji } from '@milkdown/plugin-emoji';
import { table } from '@milkdown/plugin-table';
import { math } from '@milkdown/plugin-math';
import { sendMessageToHost } from '../../extcommon';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';
import '@milkdown/plugin-emoji/lib/style.css';
import '@milkdown/plugin-tooltip/lib/style.css';
import '@milkdown/plugin-slash/lib/style.css';
import '@milkdown/plugin-table/lib/style.css';
import '@milkdown/plugin-math/lib/style.css';
import './extension.css';

sendMessageToHost({ command: 'loadDefaultTextContent' });

let editor;

const getMarkdown = () =>
  editor.action(ctx => {
    const editorView = ctx.get(editorViewCtx);
    const serializer = ctx.get(serializerCtx);
    return serializer(editorView.state.doc);
  });

const listenerConf = {
  markdown: [
    getMarkdown => {
      if (window.editMode) {
        sendMessageToHost({
          command: 'contentChangedInEditor'
          // filepath: filePath
        });
      }
      window.mdContent = getMarkdown();
    }
  ]
};

async function createEditor() {
  const editable = () => window.editMode;
  if (window.editMode) {
    editor = await new Editor()
      .config(ctx => {
        ctx.set(defaultValueCtx, window.mdContent);
        ctx.set(listenerCtx, listenerConf);
        ctx.set(editorViewOptionsCtx, { editable });
      })
      .use(commonmark)
      .use(emoji)
      .use(table)
      .use(math)
      .use(history) // not needed in edit mode
      .use(listener) // not needed in edit mode
      .use(clipboard) // not needed in edit mode
      .use(slash) // not needed in edit mode
      .use(tooltip) // not needed in edit mode
      .create();
  } else {
    editor = await new Editor()
      .config(ctx => {
        ctx.set(defaultValueCtx, window.mdContent);
        ctx.set(editorViewOptionsCtx, { editable });
      })
      .use(commonmark)
      .use(emoji)
      .use(table)
      .use(math)
      .create();
  }
}

window.addEventListener('contentLoaded', () => {
  createEditor();
});

// setTimeout(() => {
//   // readonly = true;
//   createEditor();
//   // alert(getMarkdown());
//   // alert(window.mdContent)
// }, 3000);

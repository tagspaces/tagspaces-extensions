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
import { emoji } from '@milkdown/plugin-emoji';
import { sendMessageToHost } from '../../extcommon';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';
import '@milkdown/plugin-emoji/lib/style.css';
import './extension.css';

sendMessageToHost({ command: 'loadDefaultTextContent' });

const editable = () => window.editMode;

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
  editor = await new Editor()
    .config(ctx => {
      ctx.set(defaultValueCtx, window.mdContent);
      ctx.set(listenerCtx, listenerConf);
      ctx.set(editorViewOptionsCtx, { editable });
    })
    .use(commonmark)
    .use(emoji)
    .use(history)
    .use(listener)
    .create();
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

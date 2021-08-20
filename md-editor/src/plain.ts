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
import {
  sendMessageToHost,
  hasURLProtocol,
  isWeb,
  getParameterByName
} from '../../extcommon';

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

window.addEventListener('keyup', event => {
  if (
    window.editMode &&
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === 's'
  ) {
    sendMessageToHost({ command: 'saveDocument' });
  } else if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === 'p'
  ) {
    window.print();
  }
});

window.addEventListener('dblclick', e => {
  if (!window.editMode) {
    sendMessageToHost({ command: 'editDocument' });
  }
});

window.addEventListener('contentLoaded', () => {
  createEditor()
    .then(() => {
      const elems = document.getElementsByClassName('milkdown');
      if (elems.length > 0) {
        // console.log(elems[0].textContent);

        if (!window.editMode) {
          const links = elems[0].getElementsByTagName('a');
          [...links].forEach(link => {
            let currentSrc = link.getAttribute('href');
            let path;

            if (currentSrc.indexOf('#') === 0) {
              // Leave the default link behavior by internal links
            } else {
              if (!hasURLProtocol(currentSrc)) {
                path =
                  (isWeb ? '' : 'file://') +
                  window.fileDirectory +
                  '/' +
                  encodeURIComponent(currentSrc);
                link.setAttribute('href', path);
              }
              link.addEventListener('click', evt => {
                evt.preventDefault();
                sendMessageToHost({
                  command: 'openLinkExternally',
                  link: path || currentSrc
                });
              });
            }
          });
        }

        const images = elems[0].getElementsByTagName('img');
        [...images].forEach(image => {
          console.log(image.getAttribute('src'));
          const currentSrc = image.getAttribute('src');
          if (!hasURLProtocol(currentSrc)) {
            const path =
              (isWeb ? '' : 'file://') +
              window.fileDirectory +
              '/' +
              currentSrc;
            image.setAttribute('src', path);
          }
        });
      }
      return true;
    })
    .catch(e => {
      console.warn('Error creating md-editor: ' + e);
    });
});

const theme = getParameterByName('theme');
if (theme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

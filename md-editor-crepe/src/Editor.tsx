import type { FC } from 'react';
import { useRef } from 'react';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { sendMessageToHost } from './utils';
import { replaceAll } from '@milkdown/utils';
import { useEventListener } from '@tagspaces/tagspaces-extension-ui';

interface Props {
  isEditMode?: boolean;
  readOnly?: boolean;
  mode?: string;
  content?: string;
  onChange?: (markdown: string, prevMarkdown: string) => void;
  onFocus?: () => void;
  currentFolder?: string;
}

export const MilkdownEditor: FC<Props> = (props) => {
  const {
    isEditMode,
    readOnly,
    mode,
    content,
    onChange,
    onFocus,
    currentFolder,
  } = props;

  const focus = useRef<boolean>(false);

  const { get, loading } = useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue: content || 'Loading...',
        /* features: {
        [Crepe.Feature.CodeMirror]: false,
      },*/
        featureConfigs: {
          [Crepe.Feature.Placeholder]: {
            text: 'Type / to use slash command',
          },
          /*[Crepe.Feature.ImageBlock]: {
          proxyDomURL: (originalURL: string) => {
            return `https://example.com${originalURL}`;
          }
        },*/
        },
      });
      crepe.on((listener) => {
        listener.markdownUpdated(
          (_, markdown: string, prevMarkdown: string) => {
            if (focus.current) {
              console.log('Change listener:' + markdown);
              if (onChange) {
                onChange(markdown, prevMarkdown);
              } else {
                sendMessageToHost({
                  command: 'contentChangedInEditor',
                });
              }
            }
          },
        );
        listener.focus(() => {
          focus.current = true;
          if (onFocus) {
            onFocus();
          }
        });
      });
      crepe.setReadonly(!isEditMode);
      crepe.create().then(() => {
        console.log('Editor created');
        sendMessageToHost({ command: 'parentLoadTextContent' });
      });
      /*crepe.editor.config((ctx: Ctx) => {
      ctx.update(editorViewOptionsCtx, prev => ({
        ...prev,
        /!*attributes: {
          class: 'mx-auto h-full' // text-center w-1/2 flex justify-center items-center h-screen
        },*!/
        editable: () => isEditable,
        handleClickOn: (view: EditorView, pos: number) =>
            handleClick(textEditorMode, ctx, view, pos) //, node)
      }));
    });*/

      //preventDefaultClick
      /* const observer = new MutationObserver(() => {
      const links = Array.from(root.querySelectorAll('a'));
      links.forEach(link => {
        link.onclick = () => false;
      });
    });
    observer.observe(root, {
      childList: true
    });*/

      return crepe;
    },
    [isEditMode],
  );

  useEventListener('dblclick', () => {
    if (!readOnly) {
      sendMessageToHost({ command: 'editDocument' });
    }
  });

  useEventListener('message', (event: any) => {
    if (event.data.action === 'fileContent') {
      setFileContent(event.data.content);
    }
  });

  function setFileContent(mdContent: string) {
    const editor = get();
    if (editor) {
      editor.action(replaceAll(mdContent));
    }
  }

  return <Milkdown />;
};

import { Milkdown, useEditor } from '@milkdown/react';
import { EditorStatus, editorViewCtx, commandsCtx } from '@milkdown/kit/core';
import { getMarkdown, $useKeymap, $command } from '@milkdown/kit/utils';
//import { diagram } from '@milkdown/plugin-diagram';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { createCrepeEditor, sendMessageToHost } from './utils';
import { replaceAll } from '@milkdown/utils';
import { useEventListener } from '@tagspaces/tagspaces-extension-ui';
import React, { useEffect, useRef } from 'react';
import type { MilkdownRef } from './useCrepeHandler';
import { useCrepeHandler } from './useCrepeHandler';
import { Crepe } from '@milkdown/crepe';

interface Props {
  isEditMode?: boolean;
  readOnly?: boolean;
  content?: string;
  theme?: string;
  onChange?: (markdown: string, prevMarkdown: string) => void;
  currentFolder?: string;
}

export const MilkdownEditor = React.forwardRef<MilkdownRef, Props>(
  (props, ref) => {
    const { isEditMode, readOnly, theme, content, onChange, currentFolder } =
      props;
    const crepeInstanceRef = useRef<Crepe | undefined>(undefined);
    // const menuBarPlugin = useMenuBarPlugin();

    const openLink = (link: string) => {
      sendMessageToHost({ command: 'openLinkExternally', link: link });
    };

    useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const initContent = 'Loading...';

    const { get, loading } = useEditor(
      (root) => {
        const crepe = createCrepeEditor(
          root,
          content || initContent,
          !!isEditMode,
          {},
          'Type / to use slash command',
          currentFolder,
          openLink,
          onContentChange,
        );

        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            sendMessageToHost({ command: 'parentLoadTextContent' });
            crepeInstanceRef.current = crepe;
          }
        });

        const saveCommand = $command('saveCommand', () => () => {
          return () => {
            sendMessageToHost({
              command: 'savingFile',
              content: crepe.editor.action(getMarkdown()),
            });
            return true;
          };
        });

        const saveKeyMap = $useKeymap('saveKeymap', {
          saveDescription: {
            //https://prosemirror.net/docs/ref/version/0.18.0.html#keymap
            shortcuts: 'Mod-s', //keyBindings['saveDocument'], //You can use Mod- as a shorthand for Cmd- on Mac and Ctrl- on other platforms.
            command: (ctx) => {
              const commands = ctx.get(commandsCtx);
              return () => commands.call(saveCommand.key);
            },
          },
        });

        crepe.editor.use([saveCommand, saveKeyMap].flat());
        // crepe.editor.use(diagram);
        // crepe.editor.use(menuBarPlugin);

        return crepe;
      },
      [isEditMode],
    );

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading);

    useEventListener('dblclick', () => {
      if (!readOnly) {
        sendMessageToHost({ command: 'editDocument' });
      }
    });

    useEventListener('message', (event: any) => {
      if (event.data.action === 'fileContent') {
        setFileContent(event.data.content);
      } else if (event.data.action === 'savingFile') {
        const editor = get();
        if (editor) {
          sendMessageToHost({
            command: 'savingFile',
            content: editor.action(getMarkdown()),
          });
        }
      }
    });

    const onContentChange = (markdown: string, prevMarkdown: string) => {
      /*if (
        prevMarkdown === initContent ||
        markdown === prevMarkdown
      ) {
        return;
      }*/
      const editor = get();
      if (editor) {
        const view = editor.ctx.get(editorViewCtx);
        if (view && view.hasFocus()) {
          if (onChange) {
            onChange(markdown, prevMarkdown);
          }
          sendMessageToHost({ command: 'contentChangedInEditor' });
        }
      }
    };

    function setFileContent(mdContent: string) {
      const editor = get();
      if (editor) {
        editor.action(replaceAll(mdContent));
      }
    }

    return <Milkdown />;
  },
);

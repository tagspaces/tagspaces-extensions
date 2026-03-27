import { Milkdown, useEditor } from '@milkdown/react';
import { EditorStatus, editorViewCtx, commandsCtx } from '@milkdown/kit/core';
import { getMarkdown, $useKeymap, $command } from '@milkdown/kit/utils';
//import { diagram } from '@milkdown/plugin-diagram';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import {
  createCrepeEditor,
  sendMessageToHost,
  parseFrontmatter,
  combineFrontmatter,
} from './utils';
import { replaceAll } from '@milkdown/utils';
import { useEventListener } from '@tagspaces/tagspaces-extension-ui';
import React, { useEffect, useRef, useState } from 'react';
import AppConfig from '@tagspaces/tagspaces-common/AppConfig';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
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
  onFrontmatterLoaded?: (frontmatter: string | null) => void;
}

export const MilkdownEditor = React.forwardRef<MilkdownRef, Props>(
  (props, ref) => {
    const {
      isEditMode,
      readOnly,
      theme,
      content,
      onChange,
      currentFolder,
      onFrontmatterLoaded,
    } = props;
    const crepeInstanceRef = useRef<Crepe | undefined>(undefined);
    const frontmatterRef = useRef(null as string | null);
    const [ctxMenu, setCtxMenu] = useState<{ top: number; left: number } | null>(null);
    const ctxFocusRef = useRef<{ el: HTMLElement | null; range: Range | null }>({ el: null, range: null });
    const isMac = navigator.userAgent.includes('Mac OS X');
    const mod = isMac ? '⌘' : 'Ctrl+';
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
              content: combineFrontmatter(
                frontmatterRef.current,
                crepe.editor.action(getMarkdown()),
              ),
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

    useCrepeHandler(ref, () => crepeInstanceRef.current, get, loading, frontmatterRef);

    // Context menu for Electron — suppress the native menu and show MUI Menu instead
    useEffect(() => {
      if (!AppConfig.isElectron) return;
      const onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        ctxFocusRef.current = {
          el: document.activeElement as HTMLElement | null,
          range: (() => {
            const sel = window.getSelection();
            return sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
          })(),
        };
        setCtxMenu({ top: e.clientY, left: e.clientX });
      };
      document.addEventListener('contextmenu', onContextMenu);
      return () => document.removeEventListener('contextmenu', onContextMenu);
    }, []);

    const execCtxCmd = (cmd: string) => {
      const { el, range } = ctxFocusRef.current;
      setCtxMenu(null);
      el?.focus();
      if (range) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      if (cmd === 'paste') {
        // execCommand('paste') is blocked in Electron; read clipboard manually and
        // dispatch a ClipboardEvent so ProseMirror's own paste handler processes it.
        navigator.clipboard.readText().then((text) => {
          const dt = new DataTransfer();
          dt.setData('text/plain', text);
          const target = (document.activeElement ?? el) as HTMLElement | null;
          target?.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
        });
      } else {
        // @ts-ignore -- execCommand is deprecated but required to trigger ProseMirror's clipboard event handlers
        document.execCommand(cmd);
      }
    };

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
            content: combineFrontmatter(
              frontmatterRef.current,
              editor.action(getMarkdown()),
            ),
          });
        }
      }
    });

    /**
     * fix code block issue with hasFocus(): https://github.com/Milkdown/milkdown/issues/1876
     * @param view
     */
    const isActiveInsideCodeBlock = (view?: any) => {
      // guard for SSR / missing DOM
      if (typeof document === 'undefined') return false;

      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;

      // Prefer checking the editor view DOM (if available) — safer when multiple editors exist
      const editorRoot = view?.dom as HTMLElement | undefined;

      // If the active element is inside the editor root, check for a code-block ancestor
      if (editorRoot && editorRoot.contains(active)) {
        return !!active.closest('.milkdown-code-block');
      }

      // Fallback: check anywhere in the document
      return !!active.closest('.milkdown-code-block');
    };

    const onContentChange = (markdown: string, prevMarkdown: string) => {
      if (!isEditMode) {
        return;
      }
      const editor = get();
      if (editor) {
        const view = editor.ctx.get(editorViewCtx);
        const inCodeBlock = isActiveInsideCodeBlock(view);
        if (view && (view.hasFocus() || inCodeBlock)) {
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
        const { frontmatter, body } = parseFrontmatter(mdContent);
        frontmatterRef.current = frontmatter;
        if (onFrontmatterLoaded) {
          onFrontmatterLoaded(frontmatter);
        }
        editor.action(replaceAll(body));
      }
    }

    const ctxItems = [
      { label: 'Cut',        shortcut: `${mod}X`, cmd: 'cut'       },
      { label: 'Copy',       shortcut: `${mod}C`, cmd: 'copy'      },
      { label: 'Paste',      shortcut: `${mod}V`, cmd: 'paste'     },
      { label: 'Select All', shortcut: `${mod}A`, cmd: 'selectAll' },
    ];

    return (
      <>
        <Milkdown />
        {AppConfig.isElectron && (
          <Menu
            open={ctxMenu !== null}
            onClose={() => setCtxMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={ctxMenu ?? undefined}
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
          >
            {ctxItems.map(({ label, shortcut, cmd }) => (
              <MenuItem
                key={cmd}
                dense
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCtxCmd(cmd)}
              >
                <Typography variant="body2" sx={{ flexGrow: 1 }}>{label}</Typography>
                <Typography variant="caption" sx={{ ml: 3, opacity: 0.5 }}>{shortcut}</Typography>
              </MenuItem>
            ))}
          </Menu>
        )}
      </>
    );
  },
);

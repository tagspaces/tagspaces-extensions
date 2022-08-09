import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  MilkdownPlugin,
  rootCtx
} from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
// import { cursor } from '@milkdown/plugin-cursor';
import { diagram } from '@milkdown/plugin-diagram';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { defaultActions, slash, slashPlugin } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { nord } from '@milkdown/theme-nord';
import { AtomList } from '@milkdown/utils';

/*const complete =
  (callback: () => void): MilkdownPlugin =>
  () =>
  async ctx => {
    await ctx.wait(EditorViewReady);

    callback();
  };*/

export const createEditor = (
  root: HTMLElement | null,
  defaultValue: string,
  readOnly: boolean | undefined,
  // setEditorReady: (ready: boolean) => void,
  nodes: AtomList<MilkdownPlugin>,
  onChange?: (markdown: string, prevMarkdown: string | null) => void
) => {
  return (
    Editor.make()
      .config(ctx => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, defaultValue);
        // ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
        ctx.update(editorViewOptionsCtx, (prev) => ({ ...prev, editable: () => !readOnly }));
        // ctx.set(listenerCtx, { markdown: onChange ? [onChange] : [] });
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
          if (onChange) {
            onChange(markdown, prevMarkdown);
          }
        });
      })
      .use(nord)
      // .use(commonmark)
      .use(nodes)
      // .use(gfm)
      // .use(complete(() => setEditorReady(true)))
      .use(clipboard)
      .use(listener)
      .use(history)
      // .use(cursor)
      .use(prism)
      .use(diagram)
      // .use(table)
      .use(tooltip)
      .use(math)
      .use(emoji)
      .use(
        slash.configure(
          slashPlugin,
          {
            config: ctx => {
              // Get default slash plugin items
              const actions = defaultActions(ctx);
              // Define a status builder
              return ({ isTopLevel, content, parentNode }) => {
                // You can only show something at root level
                if (!isTopLevel) return null;

                // Empty content ? Set your custom empty placeholder !
                if (!content) {
                  return {
                    placeholder: readOnly
                      ? 'Click the edit button or double click to start editing'
                      : 'Type / to use the slash commands...'
                  };
                }

                if (content.startsWith('/')) {
                  return content === '/'
                    ? {
                        placeholder: 'Type to filter...',
                        actions
                      }
                    : {
                        // @ts-ignore
                        actions: actions.filter(({ keyword }) =>
                          keyword.some((key: any) =>
                            key.includes(content.slice(1).toLocaleLowerCase())
                          )
                        )
                      };
                }
              };
            }
          }
          /*{
        placeholder: {
          [CursorStatus.Empty]: readOnly
            ? 'Click the edit button or double click to start editing'
            : 'Type / to use the slash commands...',
          [CursorStatus.Slash]: 'Type to filter...'
        }
      }*/
        )
      )
  );

  /*Editor.make()
        .config((ctx) => {
            context = ctx;
            ctx.set(rootCtx, root);
            const content = getContent();
            if (content) {
                ctx.set(defaultValueCtx, content);
            }
            ctx.set(listenerCtx, listenerConf); // { markdown: [(x) => console.log(x())] });
            ctx.set(editorViewOptionsCtx, { editable });
        })
        .use(nord)
        .use(nodes)
        // .use(AtomList.create([clickPlugin()]))
        //.use([directiveRemarkPlugin, link])
        .use(commonmark)
        .use(clipboard)
        .use(listener)
        .use(history)
        .use(emoji)
        .use(table)
        .use(math)
        .use(slash)
        .use(tooltip)*/
};

import {
  Complete,
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  MilkdownPlugin,
  rootCtx,
} from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
// import { cursor } from '@milkdown/plugin-cursor';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
// import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { gfm } from '@milkdown/preset-gfm';
import { nord } from '@milkdown/theme-nord';
import {
  commonmark,
  image,
  link,
  paragraph,
} from '@milkdown/preset-commonmark';
import { table } from '@milkdown/plugin-table';
import { AtomList } from '@milkdown/utils';

const complete =
  (callback: () => void): MilkdownPlugin =>
  () =>
  async (ctx) => {
    await ctx.wait(Complete);

    callback();
  };

export const createEditor = (
  root: HTMLElement | null,
  defaultValue: string,
  readOnly: boolean | undefined,
  setEditorReady: (ready: boolean) => void,
  nodes: AtomList<MilkdownPlugin>,
  onChange?: (getMarkdown: () => string) => void
) => {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, defaultValue);
      ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
      ctx.set(listenerCtx, { markdown: onChange ? [onChange] : [] });
    })
    .use(nord)
    .use(nodes)
    .use(gfm)
    .use(commonmark)
    .use(complete(() => setEditorReady(true)))
    .use(clipboard)
    .use(listener)
    .use(history)
    // .use(cursor)
    // .use(prism)
    .use(emoji)
    // .use(table)
    .use(tooltip)
    .use(math)
    .use(slash);

  return editor;

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

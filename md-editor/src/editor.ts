import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  EditorViewReady,
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
import { menu } from '@milkdown/plugin-menu';

const complete =
  (callback: () => void): MilkdownPlugin =>
  () =>
  async ctx => {
    await ctx.wait(EditorViewReady);

    callback();
  };

/*export const defaultConfig: Config = [
  [
    {
      type: 'select',
      text: 'Heading',
      options: [
        { id: '1', text: 'Large Heading' },
        { id: '2', text: 'Medium Heading' },
        { id: '3', text: 'Small Heading' },
        { id: '0', text: 'Plain Text' },
      ],
      disabled: (view) => {
        const { state } = view;
        const setToHeading = (level: number) => setBlockType(state.schema.nodes.heading, { level })(state);
        return (
          !(view.state.selection instanceof TextSelection) ||
          !(setToHeading(1) || setToHeading(2) || setToHeading(3))
        );
      },
      onSelect: (id) => (id ? ['TurnIntoHeading', Number(id)] : ['TurnIntoText', null]),
    },
  ],
  [
    {
      type: 'button',
      icon: 'undo',
      key: 'Undo',
      disabled: (view) => {
        return !undo(view.state);
      },
    },
    {
      type: 'button',
      icon: 'redo',
      key: 'Redo',
      disabled: (view) => {
        return !redo(view.state);
      },
    },
  ],
  [
    {
      type: 'button',
      icon: 'bold',
      key: 'ToggleBold',
      active: (view) => hasMark(view.state, view.state.schema.marks.strong),
      disabled: (view) => !view.state.schema.marks.strong,
    },
    {
      type: 'button',
      icon: 'italic',
      key: 'ToggleItalic',
      active: (view) => hasMark(view.state, view.state.schema.marks.em),
      disabled: (view) => !view.state.schema.marks.em,
    },
    {
      type: 'button',
      icon: 'strikeThrough',
      key: 'ToggleStrikeThrough',
      active: (view) => hasMark(view.state, view.state.schema.marks.strike_through),
      disabled: (view) => !view.state.schema.marks.strike_through,
    },
  ],
  [
    {
      type: 'button',
      icon: 'bulletList',
      key: 'WrapInBulletList',
      disabled: (view) => {
        const { state } = view;
        return !wrapIn(state.schema.nodes.bullet_list)(state);
      },
    },
    {
      type: 'button',
      icon: 'orderedList',
      key: 'WrapInOrderedList',
      disabled: (view) => {
        const { state } = view;
        return !wrapIn(state.schema.nodes.ordered_list)(state);
      },
    },
    {
      type: 'button',
      icon: 'taskList',
      key: 'TurnIntoTaskList',
      disabled: (view) => {
        const { state } = view;
        return !wrapIn(state.schema.nodes.task_list_item)(state);
      },
    },
    {
      type: 'button',
      icon: 'liftList',
      key: 'LiftListItem',
      disabled: (view) => {
        const { state } = view;
        return !liftListItem(state.schema.nodes.list_item)(state);
      },
    },
    {
      type: 'button',
      icon: 'sinkList',
      key: 'SinkListItem',
      disabled: (view) => {
        const { state } = view;
        return !sinkListItem(state.schema.nodes.list_item)(state);
      },
    },
  ],
  [
    {
      type: 'button',
      icon: 'link',
      key: 'ToggleLink',
      active: (view) => hasMark(view.state, view.state.schema.marks.link),
    },
    {
      type: 'button',
      icon: 'image',
      key: 'InsertImage',
    },
    {
      type: 'button',
      icon: 'table',
      key: 'InsertTable',
    },
    {
      type: 'button',
      icon: 'code',
      key: 'TurnIntoCodeFence',
    },
  ],
  [
    {
      type: 'button',
      icon: 'quote',
      key: 'WrapInBlockquote',
    },
    {
      type: 'button',
      icon: 'divider',
      key: 'InsertHr',
    },
    {
      type: 'button',
      icon: 'select',
      key: SelectParent,
    },
  ],
];*/
export const createEditor = (
  root: HTMLElement | null,
  defaultValue: string,
  readOnly: boolean | undefined,
  setEditorReady: (ready: boolean) => void,
  nodes: AtomList<MilkdownPlugin>,
  onChange?: (markdown: string, prevMarkdown: string | null) => void
) => {
  const editor = Editor.make()
    .config(ctx => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, defaultValue);
      ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
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
    .use(menu())
    .use(complete(() => setEditorReady(true)))
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
    );

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

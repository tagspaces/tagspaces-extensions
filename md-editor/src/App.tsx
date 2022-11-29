import React, { useReducer } from 'react';
import useEventListener from './useEventListener';
import './extension.css';
import MainMenu from './MainMenu';
import {
  MilkdownEditor,
  MilkdownRef,
  CodeMirror,
  CodeMirrorRef
} from '@tagspaces/tagspaces-md';

const App: React.FC = () => {
  const focusCode = React.useRef(false);
  const focus = React.useRef(false);
  const milkdownRef = React.useRef<MilkdownRef>(null);
  const codeMirrorRef = React.useRef<CodeMirrorRef>(null);
  const [mode, setMode] = React.useState('Milkdown');
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  // @ts-ignore
  const isDarkMode = window.theme && window.theme === 'dark';
  // @ts-ignore
  const readOnly = () => !window.editMode;
  // @ts-ignore
  const getContent = () => window.mdContent;

  // @ts-ignore
  useEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 's') {
        if (!readOnly()) {
          window.parent.postMessage(
            JSON.stringify({ command: 'saveDocument' }),
            '*'
          );
        }
      } else if (event.key.toLowerCase() === 'p') {
        window.print();
      }
    }
  });

  // @ts-ignore
  useEventListener('dblclick', event => {
    if (readOnly()) {
      window.parent.postMessage(
        JSON.stringify({ command: 'editDocument' }),
        '*'
      );
    }
  });

  useEventListener('themeChanged', () => {
    forceUpdate();
  });

  useEventListener('contentLoaded', () => {
    forceUpdate();
    // if (milkdownRef.current || codeMirrorRef.current) {
    // setMd(getContent());
    /*const editor = milkdownRef.current.get();
      if (editor) {
        editor.action((ctx: Ctx) => {
          const view = ctx.get(editorViewCtx);
          const parser = ctx.get(parserCtx);
          const doc = parser(getContent());
          if (!doc) return;
          const state = view.state;
          view.dispatch(
            state.tr.replace(
              0,
              state.doc.content.size,
              new Slice(doc.content, 0, 0)
            )
          );
        });
      }*/
    // }
  });

  /*let context: Ctx;
  const listenerConf = {
    markdown: [
      // @ts-ignore
      (getMarkdown) => {
        if (editable()) {
          // @ts-ignore
          window.mdContent = getMarkdown();
          window.parent.postMessage(
            JSON.stringify({
              command: 'contentChangedInEditor',
              // filepath: filePath
            }),
            '*'
          );
        }
      },
    ],
  };

  // @ts-ignore
  const directiveRemarkPlugin = remarkPluginFactory(directive);

  const clickPlugin = createProsePlugin((_, utils) => {
    const { ctx } = utils;
    const schema = ctx.get(schemaCtx);
    const parser = ctx.get(parserCtx);
    const serializer = ctx.get(serializerCtx);
    return new Plugin({
      props: {
        // https://github.com/herrdu/DEditor/blob/4557d4149f71da62532e9ab1754231f3301d8afd/src/extensions/Image.ts#L150
        handleClickOn: (view, pos, node, nodePos, event, direct) => {
          // view.dispatch(view.state.tr.replaceSelection(new Slice(slice.content, depth, depth)));

          if (direct) {
            setTimeout(() => {
              if (pos === nodePos) {
                view.dispatch(
                  view.state.tr.setSelection(
                    TextSelection.create(view.state.doc, pos, pos)
                  )
                );
              } else {
                view.dispatch(
                  view.state.tr.setSelection(
                    TextSelection.create(view.state.doc, pos + 1, pos + 1)
                  )
                );
              }
              console.log('view', view.state.selection);
            }, 0);
            console.log(
              'handleClickOn',
              this,
              view,
              pos,
              node,
              nodePos,
              event,
              direct
            );
          }
          return false;

          /!*if (node.type.name === 'link') {
            return true;
          }
          return false;*!/
        },
      },
    });
  });


  const editor = useEditor(
    (root, renderReact) => {
      const nodes = commonmark
        .configure(paragraph, { view: renderReact(TSParagraph) })
        // @ts-ignore
        .configure(link, { view: renderReact(TSLink) })
        .configure(image, { view: renderReact(TSImage) });

      return (
        Editor.make()
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
          .use(tooltip)
      );
    }
    //[window.mdContent]
  );*/

  /*const milkdownListener = React.useCallback(
    (markdown: string, prevMarkdown: string | null) => {
      updateContent(markdown, prevMarkdown);
      /!*const lock = lockCode.current;
    if (lock) return;

    const { current } = codeMirrorRef;
    if (!current) return;
    const result = getMarkdown();
    current.update(result);*!/
    },
    []
  );*/

  const milkdownListener = React.useCallback((markdown: string) => {
    const lock = focusCode.current;
    if (lock) return;

    //if (markdown !== prevMarkdown.current) {
    // prevMarkdown.current !== null &&
    updateContent(markdown);
    //}
    // update codeMirror
    const { current } = codeMirrorRef;
    if (!current) return;
    current.update(markdown);
  }, []);

  const onCodeChange = React.useCallback((getCode: () => string) => {
    const { current } = milkdownRef;
    if (!current) return;
    const value = getCode();
    current.update(value);
    updateContent(value);
  }, []);

  /*const onCodeChange = React.useCallback((code: string) => {
    updateContent(code, null);
    /!*const { current } = milkdownRef;
    if (!current) return;
    const value = getCode();
    current.update(value);*!/
  }, []);*/

  const updateContent = (content: string) => {
    //, prevContent: string | null) => {
    /*const cleanNewContent = content.replaceAll('\\_', '_').replaceAll('\n', '');
    // @ts-ignore
    const cleanContent = window.mdContent
      .replaceAll('\\_', '_')
      .replaceAll('\n', '');*/

    // if (content !== prevContent) {
    // if (cleanContent !== cleanNewContent) {
    if (focus.current || focusCode.current) {
      // @ts-ignore
      window.mdContent = content;
      // console.log('content changed:' + content);
      // @ts-ignore
      window.editMode = true;
      // TODO send only contentChangedInEditor and auto enable editDocument in Tagspaces
      /*window.parent.postMessage(
          JSON.stringify({ command: 'editDocument' }),
          '*'
      );*/
      window.parent.postMessage(
        JSON.stringify({
          command: 'contentChangedInEditor'
          // filepath: filePath
        }),
        '*'
      );
    }
  };

  const toggleViewSource = () => {
    if (mode === 'CodeMirror') {
      setMode('Milkdown');
    } else {
      setMode('CodeMirror');
    }
  };

  // return <EditorComponent ref={editorRef} editor={editor} />;
  // <ReactEditor ref={milkdownRef} editor={editor} />
  const milkdownStyle =
    mode === 'Milkdown'
      ? { width: '100%', height: '100%' }
      : { width: 0, height: 0, overflow: 'hidden' };
  const codeMirrorStyle =
    mode === 'Milkdown'
      ? { width: 0, height: 0, overflow: 'hidden' }
      : { width: '100%', height: '100%' };
  return (
    <div>
      {getContent() !== undefined && (
        <>
          <div style={milkdownStyle}>
            <MilkdownEditor
              ref={milkdownRef}
              content={getContent()}
              onChange={milkdownListener}
              onFocus={() => {
                focus.current = true;
              }}
              readOnly={readOnly()}
              dark={isDarkMode}
            />
          </div>
          <div style={codeMirrorStyle}>
            <CodeMirror
              ref={codeMirrorRef}
              value={getContent()}
              onChange={onCodeChange}
              dark={isDarkMode}
              editable={!readOnly()}
              lock={focusCode}
            />
          </div>
        </>
      )}

      <MainMenu toggleViewSource={toggleViewSource} mode={mode} />
    </div>
  );
};

export default App;

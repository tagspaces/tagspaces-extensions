import React, { useEffect, useRef, useState } from 'react';
import {
  Ctx,
  defaultValueCtx,
  Editor,
  editorViewCtx,
  editorViewOptionsCtx,
  parserCtx,
  rootCtx,
  remarkPluginFactory,
  nodeFactory,
  serializerCtx,
  schemaCtx,
} from '@milkdown/core';
import { createProsePlugin, AtomList } from '@milkdown/utils';
import { Plugin, TextSelection } from 'prosemirror-state';
import directive from 'remark-directive';

import { EditorRef, ReactEditor, useEditor, useNodeCtx } from '@milkdown/react';
import {
  commonmark,
  image,
  link,
  paragraph,
} from '@milkdown/preset-commonmark';

import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { emoji } from '@milkdown/plugin-emoji';
import { table } from '@milkdown/plugin-table';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { clipboard } from '@milkdown/plugin-clipboard';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { history } from '@milkdown/plugin-history';
import { Slice } from 'prosemirror-model';
import { nord } from '@milkdown/theme-nord';
import { math } from '@milkdown/plugin-math';
import useEventListener from './useEventListener';
import './extension.css';
import FAB from './fab';
import { CodeMirror, CodeMirrorRef } from './CodeMirror';
import MilkdownEditor, { MilkdownRef } from './MilkdownEditor';
import className from './style.module.css';

const App: React.FC = () => {
  const lockCode = React.useRef(false);
  const milkdownRef = React.useRef<MilkdownRef>(null);
  // const milkdownRef = useRef<EditorRef | null>(null);
  const codeMirrorRef = React.useRef<CodeMirrorRef>(null);
  const [md, setMd] = React.useState('');
  const [mode, setMode] = React.useState('');
  // const [isContentLoaded, setContentLoaded] = useState<boolean>(false);

  /*  useEffect(() => {
    changeContent();
    // @ts-ignore
  }, [window.mdContent]); */

  // @ts-ignore
  const editable = () => window.editMode;
  // @ts-ignore
  const getContent = () => window.mdContent;

  const pathToFile = getParameterByName('file');
  const isWeb =
    (document.URL.startsWith('http') &&
      !document.URL.startsWith('http://localhost:1212/')) ||
    pathToFile.startsWith('http');
  /*const changeContent = () => {


    // code to run after render goes here
    // if (isContentLoaded) {
    const elems = document.getElementsByClassName('milkdown');
    if (elems.length > 0) {
      // console.log(elems[0].textContent);

      // @ts-ignore
      if (!editable()) {
        const links = elems[0].getElementsByTagName('a');
        [...links].forEach((link) => {
          const currentSrc: any = link.getAttribute('href');
          let path: string;

          if (currentSrc && currentSrc.indexOf('#') === 0) {
            // Leave the default link behavior by internal links
          } else {
            if (!hasURLProtocol(currentSrc)) {
              path =
                (isWeb ? '' : 'file://') +
                // @ts-ignore
                window.fileDirectory +
                '/' +
                encodeURIComponent(currentSrc);
              link.setAttribute('href', path);
            }
            link.addEventListener('click', (evt) => {
              evt.preventDefault();
              window.parent.postMessage(
                JSON.stringify({
                  command: 'openLinkExternally',
                  link: path || currentSrc,
                }),
                '*'
              );
            });
          }
        });
      }

      const images = elems[0].getElementsByTagName('img');
      [...images].forEach((image) => {
        // console.log(image.getAttribute('src'));
        const currentSrc = image.getAttribute('src');
        if (!hasURLProtocol(currentSrc)) {
          const path =
            (isWeb ? '' : 'file://') +
            // @ts-ignore
            window.fileDirectory +
            '/' +
            currentSrc;
          image.setAttribute('src', path);
        }
      });
    }
  };*/

  // @ts-ignore
  useEventListener('keyup', (event) => {
    if (
      editable() &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 's'
    ) {
      window.parent.postMessage(
        JSON.stringify({ command: 'saveDocument' }),
        '*'
      );
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'p'
    ) {
      window.print();
    }
  });

  // @ts-ignore
  useEventListener('dblclick', (event) => {
    if (!editable()) {
      window.parent.postMessage(
        JSON.stringify({ command: 'editDocument' }),
        '*'
      );
    }
  });

  useEventListener('contentLoaded', () => {
    // setContentLoaded(true);
    if (milkdownRef.current) {
      setMd(getContent());
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
    }
  });

  function getParameterByName(paramName: string) {
    const name = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    let param =
      results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '));
    if (param.includes('#')) {
      param = param.split('#').join('%23');
    }
    return param;
  }

  function hasURLProtocol(url: any) {
    return (
      url.indexOf('http://') === 0 ||
      url.indexOf('https://') === 0 ||
      url.indexOf('file://') === 0 ||
      url.indexOf('data:') === 0
    );
  }

  // const id = 'links';
  /*const link = nodeFactory({
    id,
    schema: {
      /!*attrs: {
        href: { default: null },
      },*!/
      group: 'inline',
      inline: true,
      marks: '',
      // atom: true,
      /!*
      parseDOM: [
        {
          tag: 'a',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement)) {
              throw new Error();
            }
            return {
              href: dom.getAttribute('href'),
            };
          },
        },
      ],
      toDOM: (node) => ['a', { ...node.attrs, class: 'link' }, 0],
      *!/
    },
    parser: {
      match: (node) => {
        return node.type === 'link';
      },
      runner: (state, node, type) => {
        state.next(node.children);
        // state.openNode(type).next(node.children).closeNode();
        // state.addNode(type, { href: 'test' + node.url }, [{type:{name:'gg',type:'gg1'},value:'mm'}]);
      },
    },
    serializer: {
      match: (node) => node.type.name === id,
      runner: (state, node) => {
        /!*const span = document.createElement('span');
        span.innerHTML = node.attrs.html;
        const img = span.querySelector('img');
        const title = img?.title;
        span.remove();
        state.addNode('text', undefined, title);*!/
        /!*state.addNode('link', undefined, undefined, {
          name: 'link',
          attributes: {
            href: node.attrs.href,
          },
        });*!/
      },
    },
    /!*inputRules: (nodeType) => [
      new InputRule(/([])|\[(.*?)\]\(.*?\)/, (state, match, start, end) => {
        const [okay, href = ''] = match;
        const { tr } = state;
        if (okay) {
          tr.replaceWith(start, end, nodeType.create({ href }));
        }

        return tr;
      }),
    ],*!/
  });*/

  let context: Ctx;
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

          /*if (node.type.name === 'link') {
            return true;
          }
          return false;*/
        },
      },
    });
  });

  const TSLink: React.FC = ({ children }) => {
    const { node } = useNodeCtx();

    // title={node.attrs.title}

    const clickLink = (evt: any) => {
      evt.preventDefault();

      let path;
      if (!hasURLProtocol(node.attrs.href)) {
        path =
          (isWeb ? '' : 'file://') +
          // @ts-ignore
          window.fileDirectory +
          '/' +
          encodeURIComponent(node.attrs.href);
      } else {
        path = node.attrs.href;
      }

      window.parent.postMessage(
        JSON.stringify({
          command: 'openLinkExternally',
          link: path,
        }),
        '*'
      );
    };
    return (
      <a href="#" onClick={clickLink}>
        {children}
      </a>
    );
  };

  const TSImage: React.FC = ({ children }) => {
    const { node } = useNodeCtx();

    let path;
    if (!hasURLProtocol(node.attrs.src)) {
      path =
        (isWeb ? '' : 'file://') +
        // @ts-ignore
        window.fileDirectory +
        '/' +
        node.attrs.src;
    } else {
      path = node.attrs.src;
    }

    return (
      <img
        // className="ts-image"
        src={path}
        alt={node.attrs.alt}
        title={node.attrs.title}
      />
    );
  };

  const TSParagraph: React.FC = ({ children }) => (
    <p>
      <div style={{ display: 'inline-flex' }}>{children}</div>
    </p>
  );

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
  );

  const milkdownListener = React.useCallback((getMarkdown: () => string) => {
    const lock = lockCode.current;
    if (lock) return;

    const { current } = codeMirrorRef;
    if (!current) return;
    const result = getMarkdown();
    current.update(result);
  }, []);

  const onCodeChange = React.useCallback((getCode: () => string) => {
    const { current } = milkdownRef;
    if (!current) return;
    const value = getCode();
    current.update(value);
  }, []);

  const toggleViewSource = () => {
    if (mode === 'TwoSide') {
      setMode('');
    } else {
      setMode('TwoSide');
    }
  };

  const classes = [
    className.container,
    mode === 'TwoSide' ? className.twoSide : '',
  ].join(' ');
  const isDarkMode = true;
  // return <EditorComponent ref={editorRef} editor={editor} />;
  return (
    <div style={{ marginTop: 70 }} className={classes}>
      {/*<ReactEditor ref={milkdownRef} editor={editor} />*/}
      <div className={className.milk}>
        <MilkdownEditor
          ref={milkdownRef}
          content={md}
          onChange={milkdownListener}
        />
      </div>
      <CodeMirror
        ref={codeMirrorRef}
        value={getContent()}
        onChange={onCodeChange}
        dark={isDarkMode}
        lock={lockCode}
      />
      <FAB toggleViewSource={toggleViewSource} />
    </div>
  );
};

export default App;

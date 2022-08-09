import React, { forwardRef, ReactNode } from 'react';
import { editorViewCtx, parserCtx } from '@milkdown/core';
import { EditorRef, ReactEditor, useEditor, useNodeCtx } from '@milkdown/react';
import { Slice } from 'prosemirror-model';

import { createEditor } from './editor';
import { Loading } from './Loading';
import className from './style.module.css';
import { Content, useLazy } from './useLazy';
import { gfm, image, link } from '@milkdown/preset-gfm';
import { switchTheme } from '@milkdown/utils';
import 'katex/dist/katex.css';
import { nordDark, nordLight } from '@milkdown/theme-nord';

type Props = {
  content: Content;
  readOnly?: boolean;
  dark?: boolean;
  onChange?: (markdown: string, prevMarkdown: string | null) => void;
};

export type MilkdownRef = { update: (markdown: string) => void };
const MilkdownEditor = forwardRef<MilkdownRef, Props>(
  ({ content, readOnly, onChange, dark }, ref) => {
    // const editorRef = React.useRef<EditorRef>(null);
    // const editorRef = React.useRef({} as EditorRef);
    // const [editorReady, setEditorReady] = React.useState(false);

    const [loading, md] = useLazy(content);

    React.useImperativeHandle(ref, () => ({
      update: (markdown: string) => {
        // if (!editorReady || !editorRef.current) return;
        if (editorLoading) return;
        const editor = getInstance();
        if (!editor) return;
        editor.action(ctx => {
          const view = ctx.get(editorViewCtx);
          const parser = ctx.get(parserCtx);
          const doc = parser(markdown);
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
      }
    }));

    function hasURLProtocol(url: any) {
      return (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('file://') ||
        url.startsWith('data:') ||
        url.startsWith('ts:?ts')
      );
    }

    // @ts-ignore
    const isWeb = window.isWeb;
    //https://github.com/Saul-Mirone/milkdown/blob/main/examples/react/component/milkdown/index.tsx

    const TSLink: React.FC<{ children: ReactNode }> = ({ children }) => {
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
            link: path
          }),
          '*'
        );
      };
      return readOnly ? (
        <a href="#" onClick={clickLink}>
          {children}
        </a>
      ) : (
        <a href="#">{children}</a>
      );
    };

    const TSImage: React.FC<{ children: ReactNode }> = ({ children }) => {
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

    /*const TSParagraph: React.FC = ({ children }) => (
          <p>
              <div style={{ display: 'inline-flex' }}>{children}</div>
          </p>
      );*/

    const {
      editor,
      getInstance,
      loading: editorLoading
    } = useEditor(
      (root, renderReact) => {
        const nodes = gfm
          // .configure(paragraph, { view: renderReact(TSParagraph) })
          .configure(link, { view: renderReact(TSLink) })
          .configure(image, { view: renderReact(TSImage) });
        return createEditor(
          root,
          md,
          readOnly,
          // setEditorReady,
          nodes,
          onChange
        );
      },
      [readOnly, md, onChange]
    );

    React.useEffect(() => {
      if (editorLoading) return;
      const editor = getInstance();
      if (!editor) return;
      editor
        .action(switchTheme(dark ? nordDark : nordLight))
        .then(() => console.log('theme switched ' + dark));
    }, [editorLoading, getInstance, dark]);

    return (
      <div className={className.editor}>
        {loading ? (
          <Loading />
        ) : (
          <ReactEditor /*ref={editorRef}*/ editor={editor} />
        )}
      </div>
    );
  }
);

export default MilkdownEditor;

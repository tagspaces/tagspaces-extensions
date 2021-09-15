import React, { useEffect, useRef, useState } from "react";
import {
  Ctx,
  defaultValueCtx,
  Editor,
  editorViewCtx,
  editorViewOptionsCtx,
  parserCtx,
  rootCtx,
} from "@milkdown/core";
import { EditorRef, ReactEditor, useEditor } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";

import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { emoji } from "@milkdown/plugin-emoji";
import { table } from "@milkdown/plugin-table";
// import { math } from "@milkdown/plugin-math";
import { clipboard } from "@milkdown/plugin-clipboard";
import { slash } from "@milkdown/plugin-slash";
import { tooltip } from "@milkdown/plugin-tooltip";
import { history } from "@milkdown/plugin-history";
import { Slice } from "prosemirror-model";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import useEventListener from "./useEventListener";

import "@milkdown/theme-nord/lib/theme.css";
import "@milkdown/preset-commonmark/lib/style.css";
import "@milkdown/plugin-emoji/lib/style.css";
import "@milkdown/plugin-tooltip/lib/style.css";
import "@milkdown/plugin-slash/lib/style.css";
import "@milkdown/plugin-table/lib/style.css";
// import "@milkdown/plugin-math/lib/style.css";
import "./extension.css";

const MilkdownEditor: React.FC = () => {
  const editorRef = useRef<EditorRef | null>(null);
  const [isContentLoaded, setContentLoaded] = useState<boolean>(false);

  useEffect(() => {
    changeContent();
  }, []);

  // @ts-ignore
  const editable = () => window.editMode;
  // @ts-ignore
  const getContent = () => window.mdContent;

  const changeContent = () => {
    const pathToFile = getParameterByName("file");
    const isWeb =
      (document.URL.startsWith("http") &&
        !document.URL.startsWith("http://localhost:1212/")) ||
      pathToFile.startsWith("http");
    // code to run after render goes here
    if (isContentLoaded) {
      const elems = document.getElementsByClassName("milkdown");
      if (elems.length > 0) {
        // console.log(elems[0].textContent);

        // @ts-ignore
        if (!editable()) {
          const links = elems[0].getElementsByTagName("a");
          [...links].forEach((link) => {
            const currentSrc: any = link.getAttribute("href");
            let path: string;

            if (currentSrc && currentSrc.indexOf("#") === 0) {
              // Leave the default link behavior by internal links
            } else {
              if (!hasURLProtocol(currentSrc)) {
                path =
                  (isWeb ? "" : "file://") +
                  // @ts-ignore
                  window.fileDirectory +
                  "/" +
                  encodeURIComponent(currentSrc);
                link.setAttribute("href", path);
              }
              link.addEventListener("click", (evt) => {
                evt.preventDefault();
                window.parent.postMessage(
                  JSON.stringify({
                    command: "openLinkExternally",
                    link: path || currentSrc,
                  }),
                  "*"
                );
              });
            }
          });
        }

        const images = elems[0].getElementsByTagName("img");
        [...images].forEach((image) => {
          // console.log(image.getAttribute('src'));
          const currentSrc = image.getAttribute("src");
          if (!hasURLProtocol(currentSrc)) {
            const path =
              (isWeb ? "" : "file://") +
              // @ts-ignore
              window.fileDirectory +
              "/" +
              currentSrc;
            image.setAttribute("src", path);
          }
        });
      }
    }
  };

  // @ts-ignore
  useEventListener("keyup", (event) => {
    if (
      editable() &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "s"
    ) {
      window.parent.postMessage(
        JSON.stringify({ command: "saveDocument" }),
        "*"
      );
    } else if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "p"
    ) {
      window.print();
    }
  });

  // @ts-ignore
  useEventListener("dblclick", (event) => {
    if (!editable()) {
      window.parent.postMessage(
        JSON.stringify({ command: "editDocument" }),
        "*"
      );
    }
  });

  useEventListener("contentLoaded", () => {
    // setContentLoaded(true);
    if (editorRef.current) {
      const editor = editorRef.current.get();
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
      }
    }
  });

  function getParameterByName(paramName: string) {
    const name = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    const results = regex.exec(location.search);
    let param =
      results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    if (param.includes("#")) {
      param = param.split("#").join("%23");
    }
    return param;
  }

  function hasURLProtocol(url: any) {
    return (
      url.indexOf("http://") === 0 ||
      url.indexOf("https://") === 0 ||
      url.indexOf("file://") === 0 ||
      url.indexOf("data:") === 0
    );
  }

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
              command: "contentChangedInEditor",
              // filepath: filePath
            }),
            "*"
          );
        }
      },
    ],
  };
  const editor = useEditor(
    (root) => {
      return (
        Editor.make()
          .config((ctx) => {
            context = ctx;
            ctx.set(rootCtx, root);
            const content = getContent();
            if (content) {
              ctx.set(defaultValueCtx, content);
            }
            ctx.set(listenerCtx, listenerConf); //{ markdown: [(x) => console.log(x())] });
            ctx.set(editorViewOptionsCtx, { editable });
          })
          // .use(nord)
          .use(commonmark)
          .use(clipboard)
          .use(listener)
          .use(history)
          .use(emoji)
          .use(table)
          // .use(math)
          .use(slash)
          .use(tooltip)
      );
    }
    //[window.mdContent]
  );

  // return <EditorComponent ref={editorRef} editor={editor} />;
  return (
    <>
      <ReactEditor ref={editorRef} editor={editor} />
      <Fab color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </>
  );
};

export default MilkdownEditor;

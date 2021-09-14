import React, { useEffect, useState } from "react";
import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  rootCtx,
} from "@milkdown/core";
import { ReactEditor, useEditor } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";

import "@milkdown/theme-nord/lib/theme.css";
import "@milkdown/preset-commonmark/lib/style.css";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { emoji } from "@milkdown/plugin-emoji";
import { table } from "@milkdown/plugin-table";
import { math } from "@milkdown/plugin-math";
import { clipboard } from "@milkdown/plugin-clipboard";
import { slash } from "@milkdown/plugin-slash";
import { tooltip } from "@milkdown/plugin-tooltip";
import { history } from "@milkdown/plugin-history";
import useEventListener from "./useEventListener";

const MilkdownEditor: React.FC = () => {
  const [isContentLoaded, setContentLoaded] = useState<boolean>(false);

  useEffect(() => {

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
  }, [isContentLoaded]);

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
    setContentLoaded(true);
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

  // @ts-ignore
  const editable = () => window.editMode;
  const createEditor = () => {
    if (!isContentLoaded) {
      return null;
    }
    let editor;

    if (editable()) {
      const listenerConf = {
        markdown: [
          // @ts-ignore
          (getMarkdown) => {
            if (editable()) {
              window.parent.postMessage(
                  JSON.stringify({
                    command: "contentChangedInEditor",
                    // filepath: filePath
                  }),
                  "*"
              );
            }
            // @ts-ignore
            window.mdContent = getMarkdown();
          },
        ],
      };
      editor = useEditor(
        (root) =>
          new Editor()
            .config((ctx) => {
              ctx.set(rootCtx, root);
              // @ts-ignore
              if (window.mdContent) {
                // @ts-ignore
                ctx.set(defaultValueCtx, window.mdContent);
              }
              ctx.set(listenerCtx, listenerConf);
              ctx.set(editorViewOptionsCtx, { editable: editable() });
            })
            .use(commonmark)
            .use(listener)
        /*.use(emoji)
                    .use(table)
                    .use(math)
                    .use(history)
                    .use(clipboard)
                    .use(slash)
                    .use(tooltip)*/
      );
    } else {
      editor = useEditor(
        (root) =>
          new Editor()
            .config((ctx) => {
              ctx.set(rootCtx, root);
              // @ts-ignore
              ctx.set(defaultValueCtx, window.mdContent);
              ctx.set(editorViewOptionsCtx, { editable: editable() });
            })
            .use(commonmark)
        /*.use(emoji)
                    .use(table)
                    .use(math)*/
      );
    }
    return <ReactEditor editor={editor} />;
  };
  return createEditor();
};

export default MilkdownEditor;

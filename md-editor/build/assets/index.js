import { E as Editor, d as defaultValueCtx, l as listenerCtx, e as editorViewOptionsCtx, c as commonmark, a as emoji, t as table, m as math, h as history, b as listener, f as clipboard, s as slash, g as tooltip } from "./vendor.js";
const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
document.URL.indexOf("file:///android_asset") === 0;
const pathToFile = getParameterByName("file");
const isWeb = document.URL.startsWith("http") && !document.URL.startsWith("http://localhost:1212/") || pathToFile.startsWith("http");
navigator.appVersion.includes("Win");
navigator.userAgent.toLowerCase().indexOf(" electron/") > -1;
function getParameterByName(paramName) {
  const name = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  let param = results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  if (param.includes("#")) {
    param = param.split("#").join("%23");
  }
  return param;
}
function sendMessageToHost(message) {
  window.parent.postMessage(JSON.stringify(message), "*");
}
function hasURLProtocol(url) {
  return url.indexOf("http://") === 0 || url.indexOf("https://") === 0 || url.indexOf("file://") === 0 || url.indexOf("data:") === 0;
}
var theme$1 = `.ProseMirror {
  position: relative;
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror pre {
  white-space: pre-wrap;
}

.ProseMirror li {
  position: relative;
}

.ProseMirror-hideselection *::-moz-selection { background: transparent; }

.ProseMirror-hideselection *::selection { background: transparent; }

.ProseMirror-hideselection *::-moz-selection { background: transparent; }

.ProseMirror-hideselection { caret-color: transparent; }

.ProseMirror-selectednode {
  outline: 2px solid #8cf;
}

/* Make sure li selections wrap around markers */

li.ProseMirror-selectednode {
  outline: none;
}

li.ProseMirror-selectednode:after {
  content: "";
  position: absolute;
  left: -32px;
  right: -2px; top: -2px; bottom: -2px;
  border: 2px solid #8cf;
  pointer-events: none;
}

.milkdown .ProseMirror-selectednode {
        outline: 2px solid rgba(var(--line), 1);
    }

.milkdown li.ProseMirror-selectednode {
        outline: none;
    }

.milkdown li.ProseMirror-selectednode::after {
        border: 2px solid rgba(var(--line), 1);
    }

:root {
    --font: Roboto, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;
    --font-code: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
    --radius: 4px;
    --shadow: 59, 66, 82;
    --primary: 94, 129, 172;
    --secondary: 129, 161, 193;
    --neutral: 46, 52, 64;
    --solid: 76, 86, 106;
    --line: 216, 222, 233;
    --background: 236, 239, 244;
    --surface: 255, 255, 255;
}

[data-theme='dark'] {
    --font: Roboto, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;
    --font-code: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
    --radius: 4px;
    --shadow: 59, 66, 82;
    --primary: 94, 129, 172;
    --secondary: 129, 161, 193;
    --neutral: 236, 239, 244;
    --solid: 216, 222, 233;
    --line: 67, 76, 94;
    --background: 37, 41, 50;
    --surface: 46, 52, 64;
}
`;
var style$5 = ".milkdown {\n    color: rgba(var(--neutral), 0.87);\n    background: rgba(var(--surface), 1);\n    position: relative;\n    font-family: var(--font);\n    margin-left: auto;\n    margin-right: auto;\n    padding: 3.125rem 1.25rem;\n    box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12), 0px 1px 3px rgba(var(--shadow), 0.2);\n    box-sizing: border-box;\n}\n    @media only screen and (min-width: 72rem) {.milkdown {\n        max-width: 57.375rem;\n        padding: 3.125rem 7.25rem;\n}\n}\n    .milkdown .editor {\n        outline: none;\n    }\n    .milkdown .editor > * {\n            margin: 1.875rem 0;\n        }\n    .milkdown ::-moz-selection {\n        background: rgba(var(--secondary), 0.38);\n    }\n    .milkdown ::selection {\n        background: rgba(var(--secondary), 0.38);\n    }\n    .milkdown .strong {\n        font-weight: 600;\n    }\n    .milkdown .link {\n        color: rgba(var(--secondary), 1);\n        cursor: pointer;\n        transition: all 0.4s ease-in-out;\n        font-weight: 500;\n    }\n    .milkdown .link:hover {\n            background-color: rgba(var(--line), 1);\n            box-shadow: 0 0.2rem rgba(var(--line), 1), 0 -0.2rem rgba(var(--line), 1);\n        }\n    .milkdown .em {\n        font-style: italic;\n    }\n    .milkdown .paragraph {\n        font-size: 1rem;\n        line-height: 1.5;\n        letter-spacing: 0.5px;\n        overflow: hidden;\n    }\n    .milkdown .heading {\n        margin: 2.5rem 0;\n        font-weight: 400;\n    }\n    .milkdown .h1 {\n        font-size: 3rem;\n        line-height: 3.5rem;\n    }\n    .milkdown .h2 {\n        font-size: 2.125rem;\n        line-height: 2.25rem;\n    }\n    .milkdown .h3 {\n        font-size: 1.5rem;\n        line-height: 1.5rem;\n    }\n    .milkdown .hr {\n        height: 1px;\n        background-color: rgba(var(--line), 1);\n        border-width: 0;\n    }\n    .milkdown .list-item,\n        .milkdown .list-item > * {\n            margin: 0.5rem 0;\n        }\n    .milkdown .list-item::marker, .milkdown .list-item li::marker {\n                color: rgba(var(--primary), 1);\n            }\n    .milkdown .blockquote {\n        padding-left: 1.875rem;\n        line-height: 1.75rem;\n        border-left: 4px solid;\n        border-left-color: rgba(var(--primary), 1);\n    }\n    .milkdown .blockquote * {\n            font-size: 1rem;\n            line-height: 1.5rem;\n        }\n    .milkdown .image {\n        display: inline-block;\n        margin: 0 auto;\n        -o-object-fit: contain;\n           object-fit: contain;\n        width: 100%;\n        position: relative;\n        height: auto;\n        text-align: center;\n    }\n    .milkdown .image.empty {\n            box-sizing: border-box;\n            height: 3rem;\n            background-color: rgba(var(--background), 1);\n            border-radius: var(--radius);\n            display: inline-flex;\n            gap: 2rem;\n            justify-content: flex-start;\n            align-items: center;\n        }\n    .milkdown .image.empty .icon {\n                width: 1.5rem;\n                height: 1.5rem;\n                margin: 0;\n                margin-left: 1rem;\n                position: relative;\n            }\n    .milkdown .image.empty .icon:before {\n                    font-family: Material Icons Outlined;\n                    font-weight: normal;\n                    font-style: normal;\n                    font-size: 24px;\n                    line-height: 1;\n                    text-transform: none;\n                    letter-spacing: normal;\n                    word-wrap: normal;\n                    white-space: nowrap;\n                    display: inline-block;\n                    direction: ltr;\n                    -webkit-font-smoothing: antialiased;\n                    text-rendering: optimizeLegibility;\n                    -moz-osx-font-smoothing: grayscale;\n                    font-feature-settings: liga;\n                    position: absolute;\n                    top: 0;\n                    bottom: 0;\n                    left: 0;\n                    right: 0;\n                    content: 'image';\n                    font-size: 1.5rem;\n                    line-height: 1.5rem;\n                }\n    .milkdown .image.empty .placeholder {\n                margin: 0;\n            }\n    .milkdown .image.empty .placeholder:before {\n                    content: 'Add an image';\n                    font-size: 0.875rem;\n                    color: rgba(var(--neutral), 0.6);\n                }\n    .milkdown .code-inline {\n        background-color: rgba(var(--neutral), 1);\n        color: rgba(var(--background), 1);\n        border-radius: var(--radius);\n        font-weight: 500;\n        font-family: var(--font-code);\n        padding: 0 0.2rem;\n    }\n    .milkdown .code-fence {\n        background-color: rgba(var(--background), 1);\n        color: rgba(var(--neutral), 1);\n        font-size: 0.85rem;\n        padding: 1.2rem 0.4rem 1.4rem;\n        border-radius: var(--radius);\n        font-family: var(--font);\n    }\n    .milkdown .code-fence * {\n            margin: 0;\n        }\n    .milkdown .code-fence .code-fence_select-wrapper {\n            position: relative;\n        }\n    .milkdown .code-fence_value {\n            width: 10.25rem;\n            box-sizing: border-box;\n            border-radius: var(--radius);\n            margin: 0 1.2rem 1.2rem;\n            border: 1px solid rgba(var(--line), 1);\n            box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12),\n                0px 1px 3px rgba(var(--shadow), 0.2);\n            cursor: pointer;\n            background-color: rgba(var(--surface), 1);\n            position: relative;\n            display: flex;\n            color: rgba(var(--neutral), 0.87);\n            letter-spacing: 0.5px;\n            height: 2.625rem;\n            align-items: center;\n        }\n    .milkdown .code-fence_value > span:first-child {\n                padding-left: 1rem;\n                flex: 1;\n                font-weight: 500;\n            }\n    .milkdown .code-fence_value .icon {\n                width: 2.625rem;\n                height: 100%;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n                color: rgba(var(--solid), 0.87);\n                border-left: 1px solid rgba(var(--line), 1);\n\n                text-align: center;\n                transition: all 0.4s ease-in-out;\n            }\n    .milkdown .code-fence_value .icon:hover {\n                    background: rgba(var(--background), 1);\n                    color: rgba(var(--primary), 1);\n                }\n    .milkdown .code-fence_value .icon.active {\n                    color: rgba(var(--primary), 1);\n                }\n    .milkdown .code-fence_select[data-fold='true'] {\n                display: none;\n            }\n    .milkdown .code-fence_select {\n\n            font-weight: 500;\n            position: absolute;\n            z-index: 1;\n            top: 2.625rem;\n            box-sizing: border-box;\n            left: 1.2rem;\n            padding: 0.5rem 0;\n            max-height: 16.75rem;\n            width: 10.25rem;\n            border: 1px solid rgba(var(--line), 1);\n            box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12),\n                0px 1px 3px rgba(var(--shadow), 0.2);\n            background-color: rgba(var(--surface), 1);\n            border-top: none;\n            overflow-y: auto;\n            display: flex;\n            flex-direction: column;\n}\n    .milkdown .code-fence_select {\n\n            scrollbar-width: thin;\n\n            scrollbar-color: rgba(var(--secondary), 0.38) rgba(var(--secondary), 0.12);\n\n            -webkit-overflow-scrolling: touch;\n}\n    .milkdown .code-fence_select::-webkit-scrollbar {\n    width: 4px;\n    padding: 0 2px;\n    background: rgba(var(--surface), 1);\n}\n    .milkdown .code-fence_select::-webkit-scrollbar-track {\n    border-radius: 4px;\n    background: rgba(var(--secondary), 0.12);\n}\n    .milkdown .code-fence_select::-webkit-scrollbar-thumb {\n    border-radius: 4px;\n    background: rgba(var(--secondary), 0.38);\n}\n    .milkdown .code-fence_select::-webkit-scrollbar-thumb:hover {\n    background: rgba(var(--secondary), 1);\n}\n    .milkdown .code-fence_select-option {\n                list-style: none;\n                line-height: 2rem;\n                padding-left: 1rem;\n                cursor: pointer;\n            }\n    .milkdown .code-fence_select-option:hover {\n                    background: rgba(var(--secondary), 0.12);\n                    color: rgba(var(--primary), 1);\n                }\n    .milkdown .code-fence pre {\n            font-family: var(--font-code);\n            margin: 0 1.2rem;\n            overflow-x: scroll;\n            white-space: pre !important;\n\n            padding-bottom: 1.4rem;\n            scrollbar-width: thin;\n            scrollbar-color: rgba(var(--secondary), 0.38) rgba(var(--secondary), 0.12);\n            -webkit-overflow-scrolling: touch;\n        }\n    .milkdown .code-fence pre::-webkit-scrollbar {\n    height: 4px;\n    padding: 0 2px;\n    background: rgba(var(--surface), 1);\n}\n    .milkdown .code-fence pre::-webkit-scrollbar-track {\n    border-radius: 4px;\n    background: rgba(var(--secondary), 0.12);\n}\n    .milkdown .code-fence pre::-webkit-scrollbar-thumb {\n    border-radius: 4px;\n    background: rgba(var(--secondary), 0.38);\n}\n    .milkdown .code-fence pre::-webkit-scrollbar-thumb:hover {\n    background: rgba(var(--secondary), 1);\n}\n    .milkdown .code-fence code {\n            line-height: 1.5;\n        }\n";
var style$4 = "img.emoji {\n    height: 1em;\n    width: 1em;\n    margin: 0 0.05em 0 0.1em;\n    vertical-align: -0.1em;\n}\n\n.emoji-picker {\n    --dark-search-background-color: rgba(var(--surface), 1) !important;\n    --dark-text-color: rgba(var(--neutral), 0.87) !important;\n    --dark-background-color: rgba(var(--background), 1) !important;\n    --dark-border-color: rgba(var(--shadow), 1) !important;\n    --dark-hover-color: rgba(var(--secondary), 0.12) !important;\n    --dark-blue-color: rgba(var(--primary), 1) !important;\n    --dark-search-icon-color: rgba(var(--primary), 1) !important;\n    --dark-category-button-color: rgba(var(--secondary), 0.4) !important;\n    --font: var(--font-code) !important;\n    --font-size: 1rem !important;\n}\n\n.milkdown-emoji-filter {\n    position: absolute;\n}\n\n.milkdown-emoji-filter.hide {\n        display: none;\n    }\n\n.milkdown-emoji-filter {\n\n    border: 1px solid rgba(var(--line), 1);\n    border-radius: var(--radius);\n    background: rgba(var(--surface), 1);\n    box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12), 0px 1px 3px rgba(var(--shadow), 0.2);\n}\n\n.milkdown-emoji-filter_item {\n        display: flex;\n        gap: 0.5rem;\n        height: 2.25rem;\n        padding: 0 1rem;\n        align-items: center;\n        justify-content: flex-start;\n        cursor: pointer;\n        line-height: 2;\n        font-family: var(--font);\n        font-size: 0.875rem;\n    }\n\n.milkdown-emoji-filter_item.active {\n            background: rgba(var(--secondary), 0.12);\n            color: rgba(var(--primary), 1);\n        }\n";
var style$3 = ".tooltip {\n    display: inline-flex;\n    cursor: pointer;\n    justify-content: space-evenly;\n    position: absolute;\n    border-radius: var(--radius);\n\n    border: 1px solid rgba(var(--line), 1);\n    box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12), 0px 1px 3px rgba(var(--shadow), 0.2);\n\n    overflow: hidden;\n    background: rgba(var(--surface), 1);\n}\n\n    .tooltip .icon {\n        position: relative;\n        color: rgba(var(--solid), 0.87);\n\n        width: 3rem;\n        line-height: 3rem;\n        text-align: center;\n        transition: all 0.4s ease-in-out;\n    }\n\n    .tooltip .icon:hover {\n            background-color: rgba(var(--secondary), 0.12);\n        }\n\n    .tooltip .icon.active {\n            color: rgba(var(--primary), 1);\n        }\n\n    .tooltip .icon:not(:last-child)::after {\n            content: '';\n            position: absolute;\n            right: 0px;\n            top: 0;\n            width: 1px;\n            bottom: 0;\n            background: rgba(var(--line), 1);\n        }\n\n    .tooltip.hide,\n    .tooltip .hide {\n        display: none;\n    }\n\n.tooltip-input {\n    border: 1px solid rgba(var(--line), 1);\n    box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12), 0px 1px 3px rgba(var(--shadow), 0.2);\n    display: inline-flex;\n    justify-content: space-between;\n    align-items: center;\n    position: absolute;\n    background: rgba(var(--surface), 1);\n    border-radius: var(--radius);\n    font-size: 1rem;\n\n    height: 3.5rem;\n    box-sizing: border-box;\n    width: 20.5rem;\n    padding: 0 1rem;\n    gap: 1rem;\n}\n\n.tooltip-input input,\n    .tooltip-input button {\n        all: unset;\n    }\n\n.tooltip-input input {\n        flex-grow: 1;\n        caret-color: rgba(var(--primary), 1);\n    }\n\n.tooltip-input input::-moz-placeholder {\n            color: rgba(var(--neutral), 0.6);\n        }\n\n.tooltip-input input:-ms-input-placeholder {\n            color: rgba(var(--neutral), 0.6);\n        }\n\n.tooltip-input input::placeholder {\n            color: rgba(var(--neutral), 0.6);\n        }\n\n.tooltip-input button {\n        cursor: pointer;\n        height: 2.25rem;\n        color: rgba(var(--primary), 1);\n        font-size: 0.875rem;\n        padding: 0 0.5rem;\n        font-weight: 500;\n        letter-spacing: 1.25px;\n    }\n\n.tooltip-input button:hover {\n            background-color: rgba(var(--secondary), 0.12);\n        }\n\n.tooltip-input button.disable {\n            color: rgba(var(--neutral), 0.38);\n            cursor: not-allowed;\n        }\n\n.tooltip-input button.disable:hover {\n                background: transparent;\n            }\n\n.tooltip-input.hide {\n        display: none;\n    }\n";
var style$2 = ".slash-dropdown {\n    width: 20.5rem;\n    max-height: 20.5rem;\n    overflow-y: auto;\n    border: 1px solid rgba(var(--line), 1);\n    border-radius: var(--radius);\n    position: absolute;\n    background: rgba(var(--surface), 1);\n    box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12), 0px 1px 3px rgba(var(--shadow), 0.2);\n}\n    .slash-dropdown.hide {\n        display: none;\n    }\n    .slash-dropdown {\n\n    scrollbar-width: thin;\n\n    scrollbar-color: rgba(var(--secondary), 0.38) rgba(var(--secondary), 0.12);\n\n    -webkit-overflow-scrolling: touch;\n}\n    .slash-dropdown::-webkit-scrollbar {\n    width: 4px;\n    padding: 0 2px;\n    background: rgba(var(--surface), 1);\n}\n    .slash-dropdown::-webkit-scrollbar-track {\n    border-radius: 4px;\n    background: rgba(var(--secondary), 0.12);\n}\n    .slash-dropdown::-webkit-scrollbar-thumb {\n    border-radius: 4px;\n    background: rgba(var(--secondary), 0.38);\n}\n    .slash-dropdown::-webkit-scrollbar-thumb:hover {\n    background: rgba(var(--secondary), 1);\n}\n\n.slash-dropdown-item {\n    display: flex;\n    gap: 2rem;\n    height: 3rem;\n    padding: 0 1rem;\n    align-items: center;\n    justify-content: flex-start;\n    cursor: pointer;\n    line-height: 2;\n    font-family: var(--font);\n    font-size: 0.875rem;\n\n    transition: all 0.4s ease-in-out;\n}\n\n.slash-dropdown-item,\n    .slash-dropdown-item .icon {\n        color: rgba(var(--neutral), 0.87);\n    }\n\n.slash-dropdown-item.hide {\n        display: none;\n    }\n\n.slash-dropdown-item.active {\n        background: rgba(var(--secondary), 0.12);\n    }\n\n.slash-dropdown-item.active,\n        .slash-dropdown-item.active .icon {\n            color: rgba(var(--primary), 1);\n        }\n\n.empty-node {\n    position: relative;\n}\n\n.empty-node::before {\n        position: absolute;\n        cursor: text;\n        font-family: var(--font);\n        font-size: 0.875rem;\n        color: rgba(var(--neutral), 0.6);\n        content: attr(data-text);\n        height: 100%;\n        display: flex;\n        align-items: center;\n    }\n\n.is-slash::before {\n    left: 0.5rem;\n}\n";
var style$1 = `.ProseMirror .tableWrapper {
  overflow-x: auto;
}
.ProseMirror table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  overflow: hidden;
}
.ProseMirror td, .ProseMirror th {
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}
.ProseMirror .column-resize-handle {
  position: absolute;
  right: -2px; top: 0; bottom: 0;
  width: 4px;
  z-index: 20;
  background-color: #adf;
  pointer-events: none;
}
.ProseMirror.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}
/* Give selected cells a blue overlay */
.ProseMirror .selectedCell:after {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}
.tableWrapper {
    margin: 0 !important;
    width: 100%;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--secondary), 0.38) rgba(var(--secondary), 0.12);
    -webkit-overflow-scrolling: touch;
}
.tableWrapper::-webkit-scrollbar {
  height: 4px;
  padding: 0 2px;
  background: rgba(var(--surface), 1);
}
.tableWrapper::-webkit-scrollbar-track {
  border-radius: 4px;
  background: rgba(var(--secondary), 0.12);
}
.tableWrapper::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(var(--secondary), 0.38);
}
.tableWrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--secondary), 1);
}
.milkdown table {
        width: calc(100% - 2rem) !important;
        border-radius: var(--radius);
        box-sizing: border-box;
        margin-left: 1rem !important;
        margin-right: 0 !important;
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
        overflow: auto !important;
    }
.milkdown table * {
            margin: 0 !important;
            box-sizing: border-box;
            font-size: 1rem;
        }
.milkdown table tr {
            border-bottom: 1px solid rgba(var(--line), 1);
        }
.milkdown table th {
            background: rgba(var(--background), 0.5);
            font-weight: 400;
        }
.milkdown table th,
        .milkdown table td {
            min-width: 100px;
            border: 1px solid rgba(var(--line), 1);
            text-align: left;
            position: relative;
            line-height: 3rem;
            box-sizing: border-box;
            height: 3rem;
        }
.milkdown table .selectedCell::after {
                background: rgba(var(--secondary), 0.38);
            }
.milkdown table .selectedCell ::-moz-selection {
                background: transparent;
            }
.milkdown table .selectedCell ::selection {
                background: transparent;
            }
.milkdown table .column-resize-handle {
            background: rgba(var(--primary), 1);
            width: 1px;
        }
.milkdown table th,
        .milkdown table td {
            padding: 0 1rem;
        }
.milkdown table th p, .milkdown table td p {
                line-height: unset !important;
            }
.milkdown table .milkdown-cell-left,
        .milkdown table .milkdown-cell-right,
        .milkdown table .milkdown-cell-top {
            position: absolute;
        }
.milkdown table .milkdown-cell-left {
            position: absolute;
            left: calc(-6px - 0.5rem);
            top: 0;
            bottom: 0;
            width: 0.5rem;
        }
.milkdown table .milkdown-cell-left::after {
                cursor: pointer;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: block;
                transition: all 0.4s ease-in-out;
                background: rgba(var(--secondary), 0.12);
                content: '';
            }
.milkdown table .milkdown-cell-left:hover::after {
                background: rgba(var(--secondary), 0.38);
            }
.milkdown table .milkdown-cell-top {
            position: absolute;
            left: 0;
            right: 0;
            top: calc(-6px - 0.5rem);
            height: 0.5rem;
        }
.milkdown table .milkdown-cell-top::after {
                cursor: pointer;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: block;
                transition: all 0.4s ease-in-out;
                background: rgba(var(--secondary), 0.12);
                content: '';
            }
.milkdown table .milkdown-cell-top:hover::after {
                background: rgba(var(--secondary), 0.38);
            }
.milkdown table .milkdown-cell-point {
            position: absolute;
            left: calc(-2px - 1rem);
            top: calc(-2px - 1rem);
            width: 1rem;
            height: 1rem;
        }
.milkdown table .milkdown-cell-point::after {
                cursor: pointer;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                display: block;
                transition: all 0.4s ease-in-out;
                font-family: Material Icons Outlined;
                font-weight: normal;
                font-style: normal;
                font-size: 24px;
                line-height: 1;
                text-transform: none;
                letter-spacing: normal;
                word-wrap: normal;
                white-space: nowrap;
                display: inline-block;
                direction: ltr;
                -webkit-font-smoothing: antialiased;
                text-rendering: optimizeLegibility;
                -moz-osx-font-smoothing: grayscale;
                font-feature-settings: liga;
                content: 'select_all';
                color: rgba(var(--solid), 0.87);
                font-size: inherit;
            }
.milkdown table .milkdown-cell-point:hover::after {
                color: rgba(var(--primary), 1);
            }
.milkdown .table-tooltip {
        display: inline-flex;
        cursor: pointer;
        justify-content: space-evenly;
        position: absolute;
        border-radius: var(--radius);

        border: 1px solid rgba(var(--line), 1);
        box-shadow: 0px 1px 1px rgba(var(--shadow), 0.14), 0px 2px 1px rgba(var(--shadow), 0.12),
            0px 1px 3px rgba(var(--shadow), 0.2);

        overflow: hidden;
        background: rgba(var(--surface), 1);
    }
.milkdown .table-tooltip .icon {
            position: relative;
            color: rgba(var(--solid), 0.87);

            width: 3rem;
            line-height: 3rem;
            text-align: center;
            transition: all 0.4s ease-in-out;
        }
.milkdown .table-tooltip .icon:hover {
                background-color: rgba(var(--secondary), 0.12);
            }
.milkdown .table-tooltip .icon.active {
                color: rgba(var(--primary), 1);
            }
.milkdown .table-tooltip .icon:not(:last-child)::after {
                content: '';
                position: absolute;
                right: 0px;
                top: 0;
                width: 1px;
                bottom: 0;
                background: rgba(var(--line), 1);
            }
.milkdown .table-tooltip.hide,
        .milkdown .table-tooltip .hide {
            display: none;
        }
`;
var style = '/*---------------------------------------------------------\n *  Author: Benjamin R. Bray\n *  License: MIT (see LICENSE in project root for details)\n *--------------------------------------------------------*/\n\n/* == Math Nodes ======================================== */\n\n.math-node {\n	min-width: 1em;\n	min-height: 1em;\n	font-size: 0.95em;\n	font-family: "Consolas", "Ubuntu Mono", monospace;\n	cursor: auto;\n}\n\n.math-node.empty-math .math-render::before {\n	content: "(empty)";\n	color: red;\n}\n\n.math-node .math-render.parse-error::before {\n	content: "(math error)";\n	color: red;\n	cursor: help;\n}\n\n.math-node.ProseMirror-selectednode { outline: none; }\n\n.math-node .math-src {\n	display: none;\n	color: rgb(132, 33, 162);\n	-moz-tab-size: 4;\n	  -o-tab-size: 4;\n	     tab-size: 4;\n}\n\n.math-node.ProseMirror-selectednode .math-src { display: inline; }\n\n.math-node.ProseMirror-selectednode .math-render { display: none; }\n\n/* -- Inline Math --------------------------------------- */\n\nmath-inline { display: inline; white-space: nowrap; }\n\nmath-inline .math-render { \n	display: inline-block;\n	font-size: 0.85em;\n	cursor:pointer;\n}\n\nmath-inline .math-src .ProseMirror {\n	display: inline;\n	/* Necessary to fix FireFox bug with contenteditable, https://bugzilla.mozilla.org/show_bug.cgi?id=1252108 */\n	border-right: 1px solid transparent;\n	border-left: 1px solid transparent;\n}\n\nmath-inline .math-src::after, math-inline .math-src::before {\n	content: "$";\n	color: #b0b0b0;\n}\n\n/* -- Block Math ---------------------------------------- */\n\nmath-display { display: block; }\n\nmath-display .math-render { display: block; }\n\nmath-display.ProseMirror-selectednode { background-color: #eee; }\n\nmath-display .math-src .ProseMirror {\n	width: 100%;\n	display: block;\n}\n\nmath-display .math-src::after, math-display .math-src::before {\n	content: "$$";\n	text-align: left;\n	color: #b0b0b0;\n}\n\nmath-display .katex-display { margin: 0; }\n\n/* -- Selection Plugin ---------------------------------- */\n\np::-moz-selection, p > *::-moz-selection { background-color: #c0c0c0; }\n\np::selection, p > *::selection { background-color: #c0c0c0; }\n\n.katex-html *::-moz-selection { background-color: none !important; }\n\n.katex-html *::selection { background-color: none !important; }\n\n.math-node.math-select .math-render {\n	background-color: #c0c0c0ff;\n}\n\nmath-inline.math-select .math-render {\n	padding-top: 2px;\n}\n\n@font-face{font-family:KaTeX_AMS;font-style:normal;font-weight:400;src:url(fonts/KaTeX_AMS-Regular.woff2) format("woff2"),url(fonts/KaTeX_AMS-Regular.woff) format("woff"),url(fonts/KaTeX_AMS-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Caligraphic;font-style:normal;font-weight:700;src:url(fonts/KaTeX_Caligraphic-Bold.woff2) format("woff2"),url(fonts/KaTeX_Caligraphic-Bold.woff) format("woff"),url(fonts/KaTeX_Caligraphic-Bold.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Caligraphic;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Caligraphic-Regular.woff2) format("woff2"),url(fonts/KaTeX_Caligraphic-Regular.woff) format("woff"),url(fonts/KaTeX_Caligraphic-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Fraktur;font-style:normal;font-weight:700;src:url(fonts/KaTeX_Fraktur-Bold.woff2) format("woff2"),url(fonts/KaTeX_Fraktur-Bold.woff) format("woff"),url(fonts/KaTeX_Fraktur-Bold.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Fraktur;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Fraktur-Regular.woff2) format("woff2"),url(fonts/KaTeX_Fraktur-Regular.woff) format("woff"),url(fonts/KaTeX_Fraktur-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Main;font-style:normal;font-weight:700;src:url(fonts/KaTeX_Main-Bold.woff2) format("woff2"),url(fonts/KaTeX_Main-Bold.woff) format("woff"),url(fonts/KaTeX_Main-Bold.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Main;font-style:italic;font-weight:700;src:url(fonts/KaTeX_Main-BoldItalic.woff2) format("woff2"),url(fonts/KaTeX_Main-BoldItalic.woff) format("woff"),url(fonts/KaTeX_Main-BoldItalic.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Main;font-style:italic;font-weight:400;src:url(fonts/KaTeX_Main-Italic.woff2) format("woff2"),url(fonts/KaTeX_Main-Italic.woff) format("woff"),url(fonts/KaTeX_Main-Italic.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Main;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Main-Regular.woff2) format("woff2"),url(fonts/KaTeX_Main-Regular.woff) format("woff"),url(fonts/KaTeX_Main-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Math;font-style:italic;font-weight:700;src:url(fonts/KaTeX_Math-BoldItalic.woff2) format("woff2"),url(fonts/KaTeX_Math-BoldItalic.woff) format("woff"),url(fonts/KaTeX_Math-BoldItalic.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Math;font-style:italic;font-weight:400;src:url(fonts/KaTeX_Math-Italic.woff2) format("woff2"),url(fonts/KaTeX_Math-Italic.woff) format("woff"),url(fonts/KaTeX_Math-Italic.ttf) format("truetype")}\n\n@font-face{font-family:"KaTeX_SansSerif";font-style:normal;font-weight:700;src:url(fonts/KaTeX_SansSerif-Bold.woff2) format("woff2"),url(fonts/KaTeX_SansSerif-Bold.woff) format("woff"),url(fonts/KaTeX_SansSerif-Bold.ttf) format("truetype")}\n\n@font-face{font-family:"KaTeX_SansSerif";font-style:italic;font-weight:400;src:url(fonts/KaTeX_SansSerif-Italic.woff2) format("woff2"),url(fonts/KaTeX_SansSerif-Italic.woff) format("woff"),url(fonts/KaTeX_SansSerif-Italic.ttf) format("truetype")}\n\n@font-face{font-family:"KaTeX_SansSerif";font-style:normal;font-weight:400;src:url(fonts/KaTeX_SansSerif-Regular.woff2) format("woff2"),url(fonts/KaTeX_SansSerif-Regular.woff) format("woff"),url(fonts/KaTeX_SansSerif-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Script;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Script-Regular.woff2) format("woff2"),url(fonts/KaTeX_Script-Regular.woff) format("woff"),url(fonts/KaTeX_Script-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Size1;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size1-Regular.woff2) format("woff2"),url(fonts/KaTeX_Size1-Regular.woff) format("woff"),url(fonts/KaTeX_Size1-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Size2;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size2-Regular.woff2) format("woff2"),url(fonts/KaTeX_Size2-Regular.woff) format("woff"),url(fonts/KaTeX_Size2-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Size3;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size3-Regular.woff2) format("woff2"),url(fonts/KaTeX_Size3-Regular.woff) format("woff"),url(fonts/KaTeX_Size3-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Size4;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Size4-Regular.woff2) format("woff2"),url(fonts/KaTeX_Size4-Regular.woff) format("woff"),url(fonts/KaTeX_Size4-Regular.ttf) format("truetype")}\n\n@font-face{font-family:KaTeX_Typewriter;font-style:normal;font-weight:400;src:url(fonts/KaTeX_Typewriter-Regular.woff2) format("woff2"),url(fonts/KaTeX_Typewriter-Regular.woff) format("woff"),url(fonts/KaTeX_Typewriter-Regular.ttf) format("truetype")}\n\n.katex{text-rendering:auto;font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0}\n\n.katex *{-ms-high-contrast-adjust:none!important;border-color:currentColor}\n\n.katex .katex-version:after{content:"0.13.13"}\n\n.katex .katex-mathml{clip:rect(1px,1px,1px,1px);border:0;height:1px;overflow:hidden;padding:0;position:absolute;width:1px}\n\n.katex .katex-html>.newline{display:block}\n\n.katex .base{position:relative;white-space:nowrap;width:-webkit-min-content;width:-moz-min-content;width:min-content}\n\n.katex .base,.katex .strut{display:inline-block}\n\n.katex .textbf{font-weight:700}\n\n.katex .textit{font-style:italic}\n\n.katex .textrm{font-family:KaTeX_Main}\n\n.katex .textsf{font-family:KaTeX_SansSerif}\n\n.katex .texttt{font-family:KaTeX_Typewriter}\n\n.katex .mathnormal{font-family:KaTeX_Math;font-style:italic}\n\n.katex .mathit{font-family:KaTeX_Main;font-style:italic}\n\n.katex .mathrm{font-style:normal}\n\n.katex .mathbf{font-family:KaTeX_Main;font-weight:700}\n\n.katex .boldsymbol{font-family:KaTeX_Math;font-style:italic;font-weight:700}\n\n.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}\n\n.katex .mathcal{font-family:KaTeX_Caligraphic}\n\n.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}\n\n.katex .mathtt{font-family:KaTeX_Typewriter}\n\n.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}\n\n.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}\n\n.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}\n\n.katex .mathitsf,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}\n\n.katex .mainrm{font-family:KaTeX_Main;font-style:normal}\n\n.katex .vlist-t{border-collapse:collapse;display:inline-table;table-layout:fixed}\n\n.katex .vlist-r{display:table-row}\n\n.katex .vlist{display:table-cell;position:relative;vertical-align:bottom}\n\n.katex .vlist>span{display:block;height:0;position:relative}\n\n.katex .vlist>span>span{display:inline-block}\n\n.katex .vlist>span>.pstrut{overflow:hidden;width:0}\n\n.katex .vlist-t2{margin-right:-2px}\n\n.katex .vlist-s{display:table-cell;font-size:1px;min-width:2px;vertical-align:bottom;width:2px}\n\n.katex .vbox{align-items:baseline;display:inline-flex;flex-direction:column}\n\n.katex .hbox{width:100%}\n\n.katex .hbox,.katex .thinbox{display:inline-flex;flex-direction:row}\n\n.katex .thinbox{max-width:0;width:0}\n\n.katex .msupsub{text-align:left}\n\n.katex .mfrac>span>span{text-align:center}\n\n.katex .mfrac .frac-line{border-bottom-style:solid;display:inline-block;width:100%}\n\n.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}\n\n.katex .mspace{display:inline-block}\n\n.katex .clap,.katex .llap,.katex .rlap{position:relative;width:0}\n\n.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}\n\n.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}\n\n.katex .llap>.inner{right:0}\n\n.katex .clap>.inner,.katex .rlap>.inner{left:0}\n\n.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}\n\n.katex .rule{border:0 solid;display:inline-block;position:relative}\n\n.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{border-bottom-style:solid;display:inline-block;width:100%}\n\n.katex .hdashline{border-bottom-style:dashed;display:inline-block;width:100%}\n\n.katex .sqrt>.root{margin-left:.27777778em;margin-right:-.55555556em}\n\n.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}\n\n.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}\n\n.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}\n\n.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}\n\n.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}\n\n.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}\n\n.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}\n\n.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}\n\n.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}\n\n.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}\n\n.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.83333333em}\n\n.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.16666667em}\n\n.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.33333333em}\n\n.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}\n\n.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.66666667em}\n\n.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}\n\n.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}\n\n.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}\n\n.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.45666667em}\n\n.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.14666667em}\n\n.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.71428571em}\n\n.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.85714286em}\n\n.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.14285714em}\n\n.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.28571429em}\n\n.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.42857143em}\n\n.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.71428571em}\n\n.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.05714286em}\n\n.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.46857143em}\n\n.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.96285714em}\n\n.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.55428571em}\n\n.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}\n\n.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}\n\n.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}\n\n.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}\n\n.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}\n\n.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}\n\n.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}\n\n.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}\n\n.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}\n\n.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}\n\n.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.55555556em}\n\n.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.66666667em}\n\n.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.77777778em}\n\n.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.88888889em}\n\n.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.11111111em}\n\n.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.33333333em}\n\n.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}\n\n.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}\n\n.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.30444444em}\n\n.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.76444444em}\n\n.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}\n\n.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}\n\n.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}\n\n.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}\n\n.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}\n\n.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}\n\n.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}\n\n.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}\n\n.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}\n\n.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}\n\n.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.41666667em}\n\n.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}\n\n.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.58333333em}\n\n.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.66666667em}\n\n.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}\n\n.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.83333333em}\n\n.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}\n\n.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}\n\n.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.72833333em}\n\n.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.07333333em}\n\n.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.34722222em}\n\n.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.41666667em}\n\n.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.48611111em}\n\n.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.55555556em}\n\n.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}\n\n.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.69444444em}\n\n.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.83333333em}\n\n.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}\n\n.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.44027778em}\n\n.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.72777778em}\n\n.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.28935185em}\n\n.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.34722222em}\n\n.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.40509259em}\n\n.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.46296296em}\n\n.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.52083333em}\n\n.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037em}\n\n.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.69444444em}\n\n.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.83333333em}\n\n.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.20023148em}\n\n.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.43981481em}\n\n.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.24108004em}\n\n.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.28929605em}\n\n.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.33751205em}\n\n.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.38572806em}\n\n.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.43394407em}\n\n.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.48216008em}\n\n.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.57859209em}\n\n.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.69431051em}\n\n.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.83317261em}\n\n.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}\n\n.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.19961427em}\n\n.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.20096463em}\n\n.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.24115756em}\n\n.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.28135048em}\n\n.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.32154341em}\n\n.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.36173633em}\n\n.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.40192926em}\n\n.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.48231511em}\n\n.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.57877814em}\n\n.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.69453376em}\n\n.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.83360129em}\n\n.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}\n\n.katex .delimsizing.size1{font-family:KaTeX_Size1}\n\n.katex .delimsizing.size2{font-family:KaTeX_Size2}\n\n.katex .delimsizing.size3{font-family:KaTeX_Size3}\n\n.katex .delimsizing.size4{font-family:KaTeX_Size4}\n\n.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}\n\n.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}\n\n.katex .nulldelimiter{display:inline-block;width:.12em}\n\n.katex .delimcenter,.katex .op-symbol{position:relative}\n\n.katex .op-symbol.small-op{font-family:KaTeX_Size1}\n\n.katex .op-symbol.large-op{font-family:KaTeX_Size2}\n\n.katex .accent>.vlist-t,.katex .op-limits>.vlist-t{text-align:center}\n\n.katex .accent .accent-body{position:relative}\n\n.katex .accent .accent-body:not(.accent-full){width:0}\n\n.katex .overlay{display:block}\n\n.katex .mtable .vertical-separator{display:inline-block;min-width:1px}\n\n.katex .mtable .arraycolsep{display:inline-block}\n\n.katex .mtable .col-align-c>.vlist-t{text-align:center}\n\n.katex .mtable .col-align-l>.vlist-t{text-align:left}\n\n.katex .mtable .col-align-r>.vlist-t{text-align:right}\n\n.katex .svg-align{text-align:left}\n\n.katex svg{fill:currentColor;stroke:currentColor;fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;display:block;height:inherit;position:absolute;width:100%}\n\n.katex svg path{stroke:none}\n\n.katex img{border-style:none;max-height:none;max-width:none;min-height:0;min-width:0}\n\n.katex .stretchy{display:block;overflow:hidden;position:relative;width:100%}\n\n.katex .stretchy:after,.katex .stretchy:before{content:""}\n\n.katex .hide-tail{overflow:hidden;position:relative;width:100%}\n\n.katex .halfarrow-left{left:0;overflow:hidden;position:absolute;width:50.2%}\n\n.katex .halfarrow-right{overflow:hidden;position:absolute;right:0;width:50.2%}\n\n.katex .brace-left{left:0;overflow:hidden;position:absolute;width:25.1%}\n\n.katex .brace-center{left:25%;overflow:hidden;position:absolute;width:50%}\n\n.katex .brace-right{overflow:hidden;position:absolute;right:0;width:25.1%}\n\n.katex .x-arrow-pad{padding:0 .5em}\n\n.katex .cd-arrow-pad{padding:0 .55556em 0 .27778em}\n\n.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}\n\n.katex .boxpad{padding:0 .3em}\n\n.katex .fbox,.katex .fcolorbox{border:.04em solid;box-sizing:border-box}\n\n.katex .cancel-pad{padding:0 .2em}\n\n.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}\n\n.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}\n\n.katex .angl{border-right:.049em solid;border-top:.049em solid;box-sizing:border-box;margin-right:.03889em}\n\n.katex .anglpad{padding:0 .03889em}\n\n.katex .eqn-num:before{content:"(" counter(katexEqnNo) ")";counter-increment:katexEqnNo}\n\n.katex .mml-eqn-num:before{content:"(" counter(mmlEqnNo) ")";counter-increment:mmlEqnNo}\n\n.katex .mtr-glue{width:50%}\n\n.katex .cd-vert-arrow{display:inline-block;position:relative}\n\n.katex .cd-label-left{display:inline-block;position:absolute;right:calc(50% + .3em);text-align:left}\n\n.katex .cd-label-right{display:inline-block;left:calc(50% + .3em);position:absolute;text-align:right}\n\n.katex-display{display:block;margin:1em 0;text-align:center}\n\n.katex-display>.katex{display:block;text-align:center;white-space:nowrap}\n\n.katex-display>.katex>.katex-html{display:block;position:relative}\n\n.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}\n\n.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}\n\n.katex-display.fleqn>.katex{padding-left:2em;text-align:left}\n\nbody{counter-reset:katexEqnNo mmlEqnNo}\n\n.math-node,\n    .math-node * {\n        margin: 0 !important;\n        padding: 0;\n    }\n\n.math-render {\n    padding: 0 4px;\n}\n\n.math-src > div {\n    padding: 4px;\n    outline: none !important;\n    border-radius: var(--radius);\n    font-weight: 500;\n    font-family: var(--font-code);\n    box-sizing: border-box;\n    color: rgba(var(--secondary), 1);\n}\n\n.math-src,\nmath-display.ProseMirror-selectednode {\n    color: rgba(var(--secondary), 1);\n    background-color: rgba(var(--background), 1);\n}\n\n.ProseMirror-selectednode.math-node {\n        outline: none !important;\n    }\n';
var extension = "@font-face {\n  font-family: 'Material Icons';\n  font-style: normal;\n  font-weight: 400;\n  src: url(./MaterialIcons-Regular.eot); /* For IE6-8 */\n  src: local('Material Icons'), local('MaterialIcons-Regular'),\n    url(./MaterialIcons-Regular.woff2) format('woff2'),\n    url(./MaterialIcons-Regular.woff) format('woff'),\n    url(__VITE_ASSET__320d3688__) format('truetype');\n}\n\n.material-icons {\n  font-family: 'Material Icons';\n  font-weight: normal;\n  font-style: normal;\n  font-size: 24px; /* Preferred icon size */\n  display: inline-block;\n  line-height: 1;\n  text-transform: none;\n  letter-spacing: normal;\n  word-wrap: normal;\n  white-space: nowrap;\n  direction: ltr;\n\n  /* Support for all WebKit browsers. */\n  -webkit-font-smoothing: antialiased;\n  /* Support for Safari and Chrome. */\n  text-rendering: optimizeLegibility;\n\n  /* Support for Firefox. */\n  -moz-osx-font-smoothing: grayscale;\n\n  /* Support for IE. */\n  font-feature-settings: 'liga';\n}\n\n.milkdown {\n  width: 100%;\n  padding: 10px;\n  box-shadow: none;\n}\n\n@media print {\n  .milkdown {\n    width: 100%;\n    padding: 0;\n    box-shadow: none;\n  }\n}\n\n:root {\n  --font: Roboto, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue,\n    Helvetica, Arial, Lucida Grande, sans-serif;\n  --font-code: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;\n  --shadow: 59, 66, 82;\n  --primary: 94, 129, 172;\n  --secondary: 129, 161, 193;\n  --radius: 4px;\n  --line-width: 1px;\n  --neutral: 46, 52, 64;\n  --solid: 76, 86, 106;\n  --line: 216, 222, 233;\n  --background: 255, 255, 255;\n  --surface: 250, 250, 250;\n}\n\n[data-theme='dark'] {\n  --neutral: 236, 239, 244;\n  --solid: 216, 222, 233;\n  --line: 67, 76, 94;\n  --background: 19, 19, 19;\n  --surface: 48, 48, 48;\n}\n\n/* body {\n  background: rgba(var(--background), 1);\n} */\n";
sendMessageToHost({ command: "loadDefaultTextContent" });
const listenerConf = {
  markdown: [
    (getMarkdown2) => {
      if (window.editMode) {
        sendMessageToHost({
          command: "contentChangedInEditor"
        });
      }
      window.mdContent = getMarkdown2();
    }
  ]
};
async function createEditor() {
  const editable = () => window.editMode;
  if (window.editMode) {
    await new Editor().config((ctx) => {
      ctx.set(defaultValueCtx, window.mdContent);
      ctx.set(listenerCtx, listenerConf);
      ctx.set(editorViewOptionsCtx, { editable });
    }).use(commonmark).use(emoji).use(table).use(math).use(history).use(listener).use(clipboard).use(slash).use(tooltip).create();
  } else {
    await new Editor().config((ctx) => {
      ctx.set(defaultValueCtx, window.mdContent);
      ctx.set(editorViewOptionsCtx, { editable });
    }).use(commonmark).use(emoji).use(table).use(math).create();
  }
}
window.addEventListener("keyup", (event) => {
  if (window.editMode && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    sendMessageToHost({ command: "saveDocument" });
  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
    window.print();
  }
});
window.addEventListener("dblclick", (e) => {
  if (!window.editMode) {
    sendMessageToHost({ command: "editDocument" });
  }
});
window.addEventListener("contentLoaded", () => {
  createEditor().then(() => {
    const elems = document.getElementsByClassName("milkdown");
    if (elems.length > 0) {
      if (!window.editMode) {
        const links = elems[0].getElementsByTagName("a");
        [...links].forEach((link) => {
          let currentSrc = link.getAttribute("href");
          let path;
          if (currentSrc.indexOf("#") === 0)
            ;
          else {
            if (!hasURLProtocol(currentSrc)) {
              path = (isWeb ? "" : "file://") + window.fileDirectory + "/" + encodeURIComponent(currentSrc);
              link.setAttribute("href", path);
            }
            link.addEventListener("click", (evt) => {
              evt.preventDefault();
              sendMessageToHost({
                command: "openLinkExternally",
                link: path || currentSrc
              });
            });
          }
        });
      }
      const images = elems[0].getElementsByTagName("img");
      [...images].forEach((image) => {
        const currentSrc = image.getAttribute("src");
        if (!hasURLProtocol(currentSrc)) {
          const path = (isWeb ? "" : "file://") + window.fileDirectory + "/" + currentSrc;
          image.setAttribute("src", path);
        }
      });
    }
    return true;
  }).catch((e) => {
    console.warn("Error creating md-editor: " + e);
  });
});
const theme = getParameterByName("theme");
if (theme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
}

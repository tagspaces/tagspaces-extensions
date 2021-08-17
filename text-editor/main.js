/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals marked, CodeMirror, $, getParameterByName, sendMessageToHost, initI18N */

sendMessageToHost({ command: 'loadDefaultTextContent' });

let cmEditor;
let viewMode = true;
const locale = getParameterByName('locale');
const filePath = getParameterByName('file');
const filetype = [];
filetype.h = 'clike';
filetype.c = 'clike';
filetype.clj = 'clojure';
filetype.coffee = 'coffeescript';
filetype.cpp = 'clike';
filetype.cs = 'clike';
filetype.css = 'css';
filetype.groovy = 'groovy';
filetype.haxe = 'haxe';
filetype.htm = 'xml';
filetype.html = 'xml';
filetype.java = 'clike';
filetype.js = 'javascript';
filetype.ts = 'javascript';
filetype.jsm = 'javascript';
filetype.json = 'javascript';
filetype.less = 'less';
filetype.lua = 'lua';
filetype.markdown = 'markdown';
filetype.md = 'markdown';
filetype.mdown = 'markdown';
filetype.mdwn = 'markdown';
filetype.mkd = 'markdown';
filetype.ml = 'ocaml';
filetype.mli = 'ocaml';
filetype.pl = 'perl';
filetype.php = 'php';
filetype.py = 'python';
filetype.rb = 'ruby';
filetype.sh = 'shell';
filetype.sql = 'sql';
filetype.svg = 'xml';
filetype.xml = 'xml';
filetype.txt = 'txt';

$(document).ready(() => {
  initI18N(locale, 'ns.editorText.json');

  if (viewMode) {
    $(document).dblclick(() => {
      sendMessageToHost({ command: 'editDocument' });
    });
  }

  let extSettings;
  loadExtSettings();

  if (marked) {
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      smartLists: true,
      smartypants: false
    });
  }

  // Init Markdown Preview functionality
  $('#markdownPreviewModal').off();
  $('#markdownPreviewModal').on('show.bs.modal', () => {
    if (marked) {
      const modalBody = $('#markdownPreviewModal .modal-body');
      modalBody.html(marked(cmEditor.getValue(), { sanitize: true }));
    } else {
      console.log('markdown to html transformer not found');
    }
  });

  $('#markdownPreview').off();
  $('#markdownPreview').on('click', () => {
    $('#markdownPreviewModal').modal({ show: true });
  });

  $('#mdHelpButton').off();
  $('#mdHelpButton').on('click', () => {
    $('#markdownHelpModal').modal({ show: true });
  });

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('editorTextSettings'));
  }
});

function viewerMode(isViewerMode) {
  viewMode = isViewerMode;
  if (!viewMode) {
    cmEditor.focus();
  }

  // cmEditor.options.lineNumbers = isViewerMode;
  cmEditor.options.cursorBlinkRate = isViewerMode ? -1 : 530;
  cmEditor.options.readOnly = isViewerMode;
  cmEditor.options.foldGutter = isViewerMode;
  cmEditor.options.styleActiveLine = isViewerMode;
  cmEditor.options.matchBrackets = isViewerMode;
  cmEditor.options.showCursorWhenSelecting = isViewerMode;
  cmEditor.options.autofocus = !isViewerMode;
  cmEditor.refresh();
}

function getContent() {
  return cmEditor.getValue();
}

function setContent(content, fileDirectory, isViewMode) {
  const $editorText = $('#editorText');
  $editorText.append(
    "<div id='code' style='width: 100%; height: 100%; z-index: 9999;'>"
  );

  let fileExt = '';
  let cleanedPath = filePath;
  const lastindexQuestionMark = filePath.lastIndexOf('?');
  if (lastindexQuestionMark > 0) {
    // Removing everything after ? in URLs .png?queryParam1=2342
    cleanedPath = filePath.substring(0, lastindexQuestionMark);
  }
  fileExt = cleanedPath
    .substring(cleanedPath.lastIndexOf('.') + 1, cleanedPath.length)
    .toLowerCase();
  const mode = filetype[fileExt];

  if (
    mode !== filetype.markdown ||
    mode !== filetype.md ||
    mode !== filetype.mdown ||
    mode !== filetype.mdwn
  ) {
    $('#markdownPreview').hide();
    $('#mdHelpButton').hide();
  } else {
    $('#markdownPreview').show();
    $('#mdHelpButton').show();
  }

  const place = document.getElementById('code');
  cmEditor = new CodeMirror(place, {
    mode,
    lineNumbers: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    lineWrapping: true,
    tabSize: 2,
    // lineSeparator: isWin ? '\n\r' : null, // TODO check under windows if content contains \n\r -> set
    styleSelectedText: true,
    showCursorWhenSelecting: true,
    autofocus: !viewMode
    // theme: 'lesser-dark',
    // extraKeys: keys // workarrounded with bindGlobal plugin for mousetrap
  });

  CodeMirror.modeURL = 'libs/codemirror/mode/%N/%N.js';
  if (mode) {
    cmEditor.setOption('mode', mode);
    CodeMirror.autoLoadMode(cmEditor, mode);
  } else {
    console.warn('Invalid mode !' + mode);
  }

  viewerMode(isViewMode);

  cmEditor.setSize('100%', '100%');

  const UTF8_BOM = '\ufeff';
  if (content.indexOf(UTF8_BOM) === 0) {
    content = content.substring(1, content.length);
  }

  cmEditor.setValue(content);
  cmEditor.clearHistory();
  cmEditor.refresh();
  cmEditor.addKeyMap({
    'Ctrl-S': () => {
      if (!viewMode) {
        sendMessageToHost({ command: 'saveDocument', filepath: filePath });
      }
    }
  });

  CodeMirror.on(cmEditor, 'change', () => {
    if (!viewMode) {
      sendMessageToHost({
        command: 'contentChangedInEditor',
        filepath: filePath
      });
      $('.CodeMirror-cursor').show();
    } else {
      $('.CodeMirror-cursor').hide();
    }
  });
}

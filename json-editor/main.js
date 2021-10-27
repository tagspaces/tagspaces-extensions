/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals JSONEditor, marked, sendMessageToHost, initI18N, $, getParameterByName, handleLinks */

sendMessageToHost({ command: 'loadDefaultTextContent' });

let jsonEditor;
let isViewer = true;
let filePath;
const $document = $(document);

$(() => {
  // const locale = getParameterByName('locale');
  initI18N('en_US', 'ns.editorJSON.json');

  if (isViewer) {
    $document.dblclick(() => {
      sendMessageToHost({ command: 'editDocument' });
    });
  }

  $('#markdownHelpModal').off();
  $('#markdownHelpModal').on('show.bs.modal', () => {
    $.ajax({
      url: 'libs/jsoneditor/docs/shortcut_keys.md',
      type: 'GET'
    })
      .done(jsonData => {
        if (marked) {
          const modalBody = $('#markdownHelpModal .modal-body');
          modalBody.html(marked(jsonData, { sanitize: true }));
          handleLinks(modalBody);
        } else {
          console.log('markdown to html transformer not found');
        }
      })
      .fail(data => {
        console.warn('Loading file failed ' + data);
      });
  });

  $('#jsonHelpButton').off();
  $('#jsonHelpButton').on('click', () => {
    $('#markdownHelpModal').modal({ show: true });
  });
});

function contentChanged() {
  sendMessageToHost({ command: 'contentChangedInEditor', filepath: filePath });
}

function getContent() {
  if (jsonEditor) {
    return JSON.stringify(jsonEditor.get());
  }
}

function setContent(jsonContentParam, filePathParam, isViewMode) {
  const UTF8_BOM = '\ufeff';
  let jsonContent = jsonContentParam;
  if (jsonContent.indexOf(UTF8_BOM) === 0) {
    jsonContent = jsonContent.substring(1, jsonContent.length);
  }

  filePath = filePathParam;
  try {
    jsonContent = JSON.parse(jsonContent);
  } catch (e) {
    console.log('Error parsing JSON document. ' + e);
    return false;
  }

  const options = {
    search: true,
    history: true,
    mode: isViewer ? 'view' : 'tree',
    // modes: ['code' , 'form' , 'text' , 'tree' , 'view'] , // allowed modes
    onError: err => {
      console.warn(err.toString());
    },
    onChange: contentChanged
  };

  const container = document.getElementById('jsonEditor');

  if (
    !!Object.keys(jsonContent) &&
    (typeof jsonContent !== 'function' || jsonContent === null)
  ) {
    // console.debug(Object.keys(jsonContent));
    jsonEditor = new JSONEditor(container, options, jsonContent);
  } else {
    throw new TypeError('Object.keys called on non-object');
  }

  viewerMode(isViewMode);
}

function viewerMode(isViewerMode) {
  isViewer = isViewerMode;
  if (isViewerMode) {
    jsonEditor.setMode('view');
  } else {
    jsonEditor.setMode('tree');
  }
}

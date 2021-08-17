/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals sendMessageToHost, getParameterByName, initI18N, $, isElectron */
'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent', preview: true });

const locale = getParameterByName('locale');
const filePath = getParameterByName('file');

$(document).ready(() => {
  initI18N(locale, 'ns.viewerText.json');
});

function setContent(content, fileDir) {
  // Cutting preview content 10kb
  const previewSize = 1024 * 10;
  // console.log('Content size: ' + content.length);

  // removing the script tags from the content
  let cleanedContent = content
    .toString()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  if (cleanedContent.length > previewSize) {
    cleanedContent = cleanedContent.substring(0, previewSize);
  }

  $('#textContentArea')
    .empty()
    .text(cleanedContent);
}

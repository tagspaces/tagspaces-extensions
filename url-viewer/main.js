/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals $, sendMessageToHost, getParameterByName, initI18N */

'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent' });

$(() => {
  // const locale = getParameterByName('locale');
  initI18N('en_US', 'ns.viewerURL.json');
});

function setContent(content) {
  const $htmlContent = $('#htmlContent');
  const urlBegin = 'URL=';
  const commentTag = 'COMMENT=';
  let url = content.substring(
    content.indexOf(urlBegin) + urlBegin.length,
    content.length
  );

  let comment = content.substring(
    content.indexOf(commentTag) + commentTag.length,
    content.length
  );

  // preventing the case the url is at the end of the file or line after the url lines
  url = url + '\n';
  url = url.substring(0, url.indexOf('\n'));

  $htmlContent.append(
    $('<input>', {
      class: 'form-control',
      readonly: 'readonly',
      style: 'margin: 10px; height: 40px; width: 100%',
      title: 'Opens the URL in the default browser',
      value: url
    }).prepend("<i class='fa fa-external-link'></i>&nbsp;")
  );

  $htmlContent.append(
    $('<a>', {
      class: 'viewerURLButton btn',
      title: 'Opens the URL in the default browser',
      'data-url': url,
      text: 'Open URL'
    })
      .prepend("<i class='fa fa-external-link'></i>&nbsp;")
      .on('click', e => {
        e.preventDefault();
        sendMessageToHost({
          command: 'openLinkExternally',
          link: e.target.dataset.url
        });
      })
  );

  if (!comment.indexOf('data:image')) {
    $htmlContent.append(
      $('<img>', {
        style: 'margin: 15px; height: 100%; width: 95%',
        title: 'Image URL',
        src: comment
      })
    );
  }
}

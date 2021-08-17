/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals sendMessageToHost, getParameterByName, initI18N, $, isElectron, XLSX */

// const locale = getParameterByName('locale');
const filePath = getParameterByName('file');

const readFile = filePath => {
  const oReq = new XMLHttpRequest();
  oReq.open('GET', filePath, true);
  oReq.responseType = 'arraybuffer';

  oReq.onload = () => {
    const arrayBuffer = oReq.response; // Note: not oReq.responseText
    if (arrayBuffer) {
      const byteArray = new Uint8Array(arrayBuffer);
      processWb(XLSX.read(byteArray, { type: 'array' }));
    }
  };

  oReq.send(null);
};

// if (filePath.toLowerCase().endsWith('.csv')) {
//   sendMessageToHost({ command: 'loadDefaultTextContent', preview: true });
// } else {
//   // TODO check web
readFile(filePath);
// }

const processWb = wb => {
  const HTMLOUT = document.getElementById('htmlout');
  HTMLOUT.innerHTML = '';
  wb.SheetNames.forEach(sheetName => {
    const htmlstr = XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {
      editable: false
    });
    HTMLOUT.innerHTML += htmlstr;
  });

  $('body')
    .find('a[href]')
    .each((index, link) => {
      const currentSrc = $(link).attr('href');
      $(link).off();
      $(link).on('click', e => {
        e.preventDefault();
        sendMessageToHost({ command: 'openLinkExternally', link: currentSrc });
      });
    });
};

// function setContent(content, fileDir) {
//   processWb(XLSX.read(content, { type: 'string' }));
// }

// function saveFile(type, fn, dl) {
//     const elt = document.getElementById('data-table');
//     const wb = XLSX.utils.table_to_book(elt, {sheet:"Sheet JS"});
//     return dl ?
//         XLSX.write(wb, {bookType:type, bookSST:true, type: 'base64'}) :
//         XLSX.writeFile(wb, fn || ('test.' + (type || 'xlsx')));
// }

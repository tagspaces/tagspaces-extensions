/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals Handlebars, Nanobar, initI18N, $ */
'use strict';

var JSZip, JSZipUtils;
let maxPreviewSize = 1024 * 3 || {}; // 3kb limit for preview

$(() => {
  const filePath = getParameterByName('file');
  // const locale = getParameterByName('locale');
  initI18N('en_US', 'ns.viewerZIP.json');

  let extSettings;
  loadExtSettings();

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerZIPSettings'));
  }

  JSZipUtils.getBinaryContent(filePath, (err, data) => {
    if (err) {
      throw err; // or handle err
    }
    JSZip.loadAsync(data).then(data => {
      loadZipFile(data, filePath);
    });

    //JSZip.loadAsync(data).then(function (zip) {
    //  var re = /(.jpg|.png|.gif|.ps|.jpeg)$/;
    //  var promises = Object.keys(zip.files).filter(function(fileName) {
    //    // don't consider non image files
    //    console.log(fileName);
    //    return re.test(fileName.toLowerCase());
    //  })
    //});
    //  Object.keys(zip.files).map(function (fileName) {
    //    var file = zip.files[fileName];
    //    return file.async("text").then(function (blob) {
    //      console.log(blob);
    //      return [
    //        fileName,  // keep the link between the file name and the content
    //        URL.createObjectURL(blob) // create an url. img.src = URL.createObjectURL(...) will work
    //      ];
    //    });
    //  });
    //  // `promises` is an array of promises, `Promise.all` transforms it
    //  // into a promise of arrays
    //  return Promise.all(promises);
    //}).then(function (result) {
    //  // we have here an array of [fileName, url]
    //  // if you want the same result as imageSrc:
    //  return result.reduce(function (acc, val) {
    //    acc[val[0]] = val[1];
    //    return acc;
    //  }, {});
    //}).catch(function (e) {
    //  console.error(e);
    //});
  });
});

function loadZipFile(zipFile, filePath) {
  const $zipContent = $('#zipContent');

  $zipContent.append(zipFile);

  // if (filePath.indexOf('file://') === 0) {
  //   filePath = filePath.substring(('file://').length , filePath.length);
  // }

  $zipContent.append('<div/>').css({
    overflow: 'auto',
    padding: '5px',
    fontSize: 12,
    width: '100%',
    height: '100%'
  });
  $zipContent.append(
    '<p><h5>This archive contains the following files:</h5></p>'
  );
  const ulFiles = $zipContent.append('<ul/>');

  function showPreviewDialog(event) {
    event.preventDefault();
    const containFile = zipFile.files[$(this).text()];
    containFile.options.compression = 'STORE';
    containFile.async('text').then(blob => {
      showContentFilePreviewDialog(blob);
      //return [
      //  fileName,  // keep the link between the file name and the content
      //  URL.createObjectURL(blob) // create an url. img.src = URL.createObjectURL(...) will work
      //];
    });
  }

  if (
    !!Object.keys(zipFile.files) &&
    (typeof zipFile !== 'function' || zipFile === null)
  ) {
    for (const fileName in zipFile.files) {
      if (zipFile.files[fileName].dir === true) {
        continue;
      }
      const linkToFile = $('<a>')
        .attr('href', '#')
        .text(fileName);
      linkToFile.click(showPreviewDialog);
      const liFile = $('<li/>')
        .css('list-style-type', 'none')
        .append(linkToFile);
      ulFiles.append(liFile);
    }
  } else {
    throw new TypeError('Object.keys called on non-object');
  }
}

function showContentFilePreviewDialog(containFile) {
  const unitArr = containFile;
  let previewText = '';
  const byteLength =
    unitArr.byteLength > maxPreviewSize ? maxPreviewSize : unitArr.byteLength;

  for (let i = 0; i < byteLength; i++) {
    previewText += String.fromCharCode(unitArr[i]);
  }
  previewText = containFile;
  const fileContent = $('<pre/>').text(previewText);

  $.post('previewDialog.html', uiTPL => {
    if ($('#previewDialog').length < 1) {
      const uiTemplate = Handlebars.compile(uiTPL);
      $('body').append(uiTemplate());
    }
    const dialogPreview = $('#previewDialog');
    dialogPreview
      .find('.modal-body')
      .empty()
      .append(fileContent);
    dialogPreview.modal({
      backdrop: 'static',
      show: true
    });
    const nanobar = new Nanobar({
      bg: '#42BEDB', //(optional) background css property, '#000' by default
      target: document.getElementById('nanoBar'), //(optional) Where to put the progress bar, nanobar will be fixed to top of document if target is null
      // id for new nanobar
      id: 'nanoBar' // (optional) id for nanobar d
    });

    const progressChunk = parseInt(byteLength / 100);
    let currentProgress = 0;
    for (let i = 0; i < byteLength; i++) {
      const check = i % progressChunk === 0;
      if (check) {
        currentProgress++;
        if (currentProgress <= 100) {
          nanobar.go(currentProgress);
        }
      }
      previewText += String.fromCharCode(unitArr[i]);
    }
  }).always(() => {
    window.setTimeout(() => {
      document.getElementById('nanoBar').remove();
    }, 1000);
  });
}

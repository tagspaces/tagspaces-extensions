/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals initI18N, getParameterByName, $, isWeb, isCordova, Viewer, EXIF, jQuery, Tiff */

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

const chromeVersion = getChromeVersion();

$(document).ready(() => {
  let filePath = getParameterByName('file'); // TODO check decodeURIComponent loading fileswith#inthe.name
  const locale = getParameterByName('locale');
  initI18N(locale, 'ns.viewerImage.json');

  if (isCordova || isWeb) {
    // Cordova or web case
  } else {
    filePath = 'file://' + filePath;
  }

  const $imgViewer = $('#imageContainer');
  let exifObj;

  // load settings for viewerSettings
  const extSettings = JSON.parse(localStorage.getItem('imageViewerSettings'));
  let imageBackgroundColor = '#000000';
  if (extSettings && extSettings.imageBackgroundColor) {
    imageBackgroundColor = extSettings.imageBackgroundColor;
  }

  // save settings for viewerSettings
  function saveExtSettings() {
    const settings = {
      imageBackgroundColor
    };
    localStorage.setItem('imageViewerSettings', JSON.stringify(settings));
    console.debug(settings);
  }

  let orientation;
  let viewer;

  if (
    filePath.toLowerCase().endsWith('.tiff') ||
    filePath.toLowerCase().endsWith('.tif')
  ) {
    $.getScript('libs/tiff.js/tiff.min.js', () => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', filePath);
      xhr.onload = () => {
        const tiff = new Tiff({ buffer: xhr.response });
        const canvas = tiff.toCanvas();
        $('#imageContent').attr('src', canvas.toDataURL());
      };
      xhr.send();
    });
  } else if (filePath.toLowerCase().endsWith('.psd')) {
    $.getScript('libs/psd/dist/psd.min.js', () => {
      const PSD = require('psd');
      PSD.fromURL(filePath)
        .then(psd => {
          const image = psd.image.toPng();
          $('#imageContent').attr('src', image.getAttribute('src'));
          return true;
        })
        .catch(() => console.warn('Error loading PSD'));
    });
  } else {
    $('#imageContent').attr('src', filePath);
  }

  let imageViewerContainer;

  $('#imageContent').on('load', event => {
    viewer = new Viewer(document.getElementById('imageContent'), {
      movable: true,
      navbar: false,
      toolbar: false,
      title: false,
      transition: false,
      fullscreen: true,
      inline: 'inline',
      // fading: true,
      hide: e => {
        console.log(e.type);
      },
      viewed: () => {
        imageViewerContainer = document.getElementsByClassName(
          'viewer-container'
        );
        imageViewerContainer[0].style.background = 'transparent';
        // if (
        //   imageViewerContainer &&
        //   imageViewerContainer[0] &&
        //   imageViewerContainer[0].style
        // ) {
        //   imageViewerContainer[0].style.background = imageBackgroundColor;
        // }

        if (
          filePath.toLowerCase().includes('.jpg') ||
          filePath.toLowerCase().includes('.jpeg')
        ) {
          EXIF.getData(eTarget, () => {
            orientation = EXIF.getTag(eTarget, 'Orientation');
            // if (chromeVersion && chromeVersion >= 81) {
            //   // no rotation needed
            // } else {
            //   switch (orientation) {
            //     case 8:
            //       viewer.rotate(-90);
            //       break;
            //     case 3:
            //       viewer.rotate(180);
            //       break;
            //     case 6:
            //       viewer.rotate(90);
            //       break;
            //     case 1:
            //       viewer.rotate(0);
            //       break;
            //     default:
            //       break;
            //   }
            // }

            // console.log(EXIF.pretty(this));
            // Construct EXIF info
            exifObj = {};
            const tags = [
              'Make',
              'Model',
              'DateTime',
              'Artist',
              'Copyright',
              'ExposureTime ',
              'FNumber',
              'ISOSpeedRatings',
              'ShutterSpeedValue',
              'ApertureValue',
              'FocalLength',
              'GPSLatitude',
              'GPSLatitudeRef',
              'GPSLongitude',
              'GPSLongitudeRef'
            ];
            for (let tag in tags) {
              const prop = tags[tag];
              if (eTarget.exifdata.hasOwnProperty(prop)) {
                exifObj[prop] = eTarget.exifdata[prop];
              }
            }
            jQuery.extend(exifObj, eTarget.iptcdata);
            if (!jQuery.isEmptyObject(exifObj)) {
              $('#exifButton')
                .parent()
                .show();
              printEXIF();
            }
          });
        }
      }
    });
    viewer.full();

    const $imageContentViewer = $('#imageContent');
    const eTarget = event.target;

    $imageContentViewer.addClass('transparentImageBackground');
    $imgViewer.addClass('imgViewer');
  });

  $('#imageContent').css('visibility', 'hidden');

  const offset = 0;
  $('#zoomInButton').off();
  $('#zoomInButton').on('click', e => {
    e.stopPropagation();
    viewer.zoom(offset + 1);
  });

  $('#zoomOutButton').off();
  $('#zoomOutButton').on('click', e => {
    e.stopPropagation();
    viewer.zoom(offset - 1);
  });

  $('#zoomResetButton').off();
  $('#zoomResetButton').on('click', () => {
    viewer.zoomTo(1);
  });

  $('#fitToScreen').off();
  $('#fitToScreen').on('click', () => {
    viewer.reset();
  });

  $('#rotateLeftButton').off();
  $('#rotateLeftButton').on('click', e => {
    e.stopPropagation();
    viewer.rotate(-90);
  });

  $('#rotateRightButton').off();
  $('#rotateRightButton').on('click', e => {
    e.stopPropagation();
    viewer.rotate(90);
  });

  let flipHorizontal;
  let flipVertical;
  let flipBoth;
  let flipColor;
  $('#flipHorizontal').off();
  $('#flipHorizontal').on('click', e => {
    e.stopPropagation();
    if (flipHorizontal === true) {
      flipHorizontal = false;
      viewer.scaleX(1); // Flip horizontal
    } else {
      flipHorizontal = true;
      viewer.scaleX(-1); // Flip horizontal
    }
  });

  $('#flipVertical').off();
  $('#flipVertical').on('click', e => {
    e.stopPropagation();
    if (flipVertical === true) {
      flipVertical = false;
      viewer.scaleY(1); // Flip horizontal
    } else {
      flipVertical = true;
      viewer.scaleY(-1); // Flip vertical
    }
  });

  $('#flipBoth').off();
  $('#flipBoth').on('click', e => {
    e.stopPropagation();
    if (flipBoth === true) {
      flipBoth = false;
      viewer.scale(1); // Flip horizontal
    } else {
      flipBoth = true;
      viewer.scale(-1); // Flip both horizontal and vertical
    }
  });

  $('#whiteBackgroundColor').off();
  $('#whiteBackgroundColor').on('click', e => {
    e.stopPropagation();
    document.body.style.background = '#ffffff';
    imageViewerContainer[0].style.background = '#ffffff';
    imageBackgroundColor = '#ffffff';
    saveExtSettings();
  });

  $('#blackBackgroundColor').off();
  $('#blackBackgroundColor').on('click', e => {
    e.stopPropagation();
    document.body.style.background = '#000000';
    imageViewerContainer[0].style.background = '#000000';
    imageBackgroundColor = '#000000';
    saveExtSettings();
  });

  $('#sepiaBackgroundColor').off();
  $('#sepiaBackgroundColor').on('click', e => {
    e.stopPropagation();
    document.body.style.background = '#f4ecd8';
    imageViewerContainer[0].style.background = '#f4ecd8';
    imageBackgroundColor = '#f4ecd8';
    saveExtSettings();
  });

  $('#flipBlackAndWhiteColor').off();
  $('#flipBlackAndWhiteColor').on('click', e => {
    e.stopPropagation();
    if (flipColor) {
      flipColor = false;
      imageViewerContainer[0].style.filter = 'grayscale(0%)';
      imageViewerContainer[0].style.WebkitFilter = 'grayscale(0%)';
    } else {
      flipColor = true;
      imageViewerContainer[0].style.filter = 'grayscale(100%)';
      imageViewerContainer[0].style.WebkitFilter = 'grayscale(100%)';
    }
  });

  function printEXIF() {
    const $exifRow = $('#exifRow').clone(); // Preparing the template
    const $exifTableBody = $('#exifTableBody');
    $exifTableBody.empty();
    for (let key in exifObj) {
      if (exifObj.hasOwnProperty(key) && exifObj[key].length !== 0) {
        $exifRow.find('th').text(key);
        $exifRow.find('td').text(exifObj[key]);
        $exifTableBody.append($exifRow.clone());
      }
    }
  }

  // if (isCordova) {
  //  $('#printButton').hide();
  // }
});

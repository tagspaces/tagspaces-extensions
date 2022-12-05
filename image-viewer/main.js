/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals initI18N, getParameterByName, $, isWeb, isCordova, Viewer, EXIF, jQuery, Tiff */

$(() => {
  let filePath = getParameterByName('file'); // TODO check decodeURIComponent loading fileswith#inthe.name
  let locale = getParameterByName('locale');
  if (locale === 'en') {
    locale = 'en_US';
  }
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
    const eTarget = event.target;
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
        exifObj = {};
        exifObj['Width'] = eTarget.naturalWidth;
        exifObj['Height'] = eTarget.naturalHeight;

        if (
          filePath.toLowerCase().includes('.jpg') ||
          filePath.toLowerCase().includes('.jpeg')
        ) {
          EXIF.getData(eTarget, () => {
            orientation = EXIF.getTag(eTarget, 'Orientation');
            // console.log(EXIF.pretty(this));
            // Construct EXIF info
            exifObj = {};
            exifObj['Width'] = eTarget.naturalWidth;
            exifObj['Height'] = eTarget.naturalHeight;
            orientationText = '0°';
            // 1= 0 degrees: the correct orientation, no adjustment is required.
            // 2= 0 degrees, mirrored: image has been flipped back-to-front.
            // 3= 180 degrees: image is upside down.
            // 4= 180 degrees, mirrored: image has been flipped back-to-front and is upside down.
            // 5= 90 degrees: image has been flipped back-to-front and is on its side.
            // 6= 90 degrees, mirrored: image is on its side.
            // 7= 270 degrees: image has been flipped back-to-front and is on its far side.
            // 8= 270 degrees, mirrored: image is on its far side.
            if (orientation === 1) {
              orientationText = '0°';
            } else if (orientation === 2) {
              orientationText = '0°, mirrored';
            } else if (orientation === 3) {
              orientationText = '180°';
            } else if (orientation === 4) {
              orientationText = '180°, mirrored';
            } else if (orientation === 5) {
              orientationText = '90°';
            } else if (orientation === 6) {
              orientationText = '90°, mirrored°';
            } else if (orientation === 7) {
              orientationText = '270°';
            } else if (orientation === 8) {
              orientationText = '270°, mirrored';
            }
            if (orientation) {
              exifObj['Orientation'] = orientationText;
            }
            const tags = [
              'Make',
              'Model',
              'DateTime',
              'Artist',
              'Copyright',
              'ExposureTime ',
              'FNumber',
              'Flash',
              'WhiteBalance',
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
              printEXIF();
            }
          });
        }
        if (!jQuery.isEmptyObject(exifObj)) {
          printEXIF();
        }
      }
    });
    setTimeout(() => {
      viewer.full();
    }, 10); // fix for issue making first loaded image invisible by incorrect margin-top
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
});

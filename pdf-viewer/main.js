/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

(() => {
  // const locale = getParameterByName('locale');
  const filePath = getParameterByName('file') || '../../example.pdf';

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      const pdfViewer = document.getElementById('pdfviewer');
      pdfViewer.setAttribute(
        'src',
        'generic/web/viewer.html?file=' + encodeURIComponent(filePath)
      );
    }
  };
})();

// function setTheme(theme) {
//   // document.documentElement.className = theme;
//   if (theme === 'dark') {
//     document.documentElement.setAttribute('data-theme', 'dark');
//   } else {
//     document.documentElement.setAttribute('data-theme', 'light');
//   }
//   console.log('Theme:' + document.documentElement.getAttribute('data-theme'));
// }

// if (theme) {
//   setTheme(theme);
// }

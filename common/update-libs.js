const sh = require('shelljs');

// cp('file1', 'dir1');
// cp('-R', 'path/to/dir/', '~/newCopy/');
// cp('-Rf', '/tmp/*', '/usr/local/*', '/home/tmp');
// cp('-Rf', ['/tmp/*', '/usr/local/*'], '/home/tmp'); // same as above

sh.rm('-rf', 'libs/jquery/');
sh.mkdir('libs/jquery');
sh.cp('-R', 'node_modules/jquery/dist', 'libs/jquery');
sh.cp('node_modules/jquery/LICENSE.txt', 'libs/jquery');

sh.rm('-rf', 'libs/bootstrap5/');
sh.mkdir('libs/bootstrap5');
sh.cp('node_modules/bootstrap5/LICENSE', 'libs/bootstrap5');
sh.cp(
  'node_modules/bootstrap5/dist/js/bootstrap.bundle.min.js',
  'libs/bootstrap5',
);
sh.cp('node_modules/bootstrap5/dist/css/bootstrap.min.css', 'libs/bootstrap5');

sh.rm('-rf', 'libs/dompurify/');
sh.mkdir('libs/dompurify');
sh.cp('-R', 'node_modules/dompurify/dist', 'libs/dompurify/');
sh.cp('node_modules/dompurify/LICENSE', 'libs/dompurify');

sh.rm('-rf', 'libs/file-saver/');
sh.mkdir('libs/file-saver');
sh.cp('node_modules/file-saver/LICENSE.md', 'libs/file-saver');
sh.cp('node_modules/file-saver/dist/FileSaver.min.js', 'libs/file-saver');

sh.rm('-rf', 'libs/viewerjs/');
sh.mkdir('libs/viewerjs');
sh.cp('node_modules/viewerjs/dist/viewer.min.js', 'libs/viewerjs');
sh.cp('node_modules/viewerjs/dist/viewer.min.css', 'libs/viewerjs');
sh.cp('node_modules/viewerjs/LICENSE', 'libs/viewerjs');

sh.rm('-rf', 'libs/marked/');
sh.mkdir('libs/marked');
sh.cp('node_modules/marked/LICENSE.md', 'libs/marked');
sh.cp('node_modules/marked/marked.min.js', 'libs/marked');

sh.rm('-rf', 'libs/mark.js/');
sh.mkdir('libs/mark.js/');
sh.cp('node_modules/mark.js/LICENSE', 'libs/mark.js');
sh.cp('node_modules/mark.js/dist/mark.min.js', 'libs/mark.js');

sh.rm('-rf', 'libs/jszip/');
sh.mkdir('libs/jszip/');
sh.cp('node_modules/jszip/LICENSE.markdown', 'libs/jszip');
sh.cp('node_modules/jszip/dist/jszip.min.js', 'libs/jszip');

sh.rm('-rf', 'libs/jszip-utils/');
sh.mkdir('libs/jszip-utils/');
sh.cp('node_modules/jszip-utils/LICENSE.markdown', 'libs/jszip-utils');
sh.cp('node_modules/jszip-utils/dist/jszip-utils.min.js', 'libs/jszip-utils');

sh.rm('-rf', 'libs/i18next/');
sh.mkdir('libs/i18next');
sh.cp('node_modules/i18next/LICENSE', 'libs/i18next');
sh.cp('node_modules/i18next/i18next.min.js', 'libs/i18next');
// sh.cp('node_modules/i18next/i18next.js', 'libs/i18next');
// sh.cp('node_modules/i18next/karma.backward.conf.js', 'libs/i18next');

sh.rm('-rf', 'libs/readability/');
sh.mkdir('libs/readability');
sh.cp('node_modules/@mozilla/readability/README.md', 'libs/readability');
sh.cp('node_modules/@mozilla/readability/JSDOMParser.js', 'libs/readability');
sh.cp('node_modules/@mozilla/readability/Readability.js', 'libs/readability');

// sh.rm('-rf', 'html-editor/libs/summernote');
// sh.mkdir('html-editor/libs/summernote');
// sh.mkdir('html-editor/libs/summernote/font');
// sh.mkdir('html-editor/libs/summernote/lang');
// sh.cp('node_modules/summernote/README.md', 'html-editor/libs/summernote');
// sh.cp('node_modules/summernote/LICENSE', 'html-editor/libs/summernote');
// sh.cp(
//   'node_modules/summernote/dist/font/*',
//   'html-editor/libs/summernote/dist/font/'
// );
// sh.cp(
//   'node_modules/summernote/dist/lang/*.js',
//   'html-editor/libs/summernote/dist/lang/'
// );
// sh.cp(
//   'node_modules/summernote/dist/summernote-bs5.css',
//   'html-editor/libs/summernote/'
// );
// sh.cp(
//   'node_modules/summernote/dist/summernote.bs5.min.js',
//   'html-editor/libs/summernote/dist/'
// );

sh.rm('-rf', '3d-viewer/libs/');
sh.mkdir('3d-viewer/libs');
sh.mkdir('3d-viewer/libs/model-viewer');
sh.cp(
  'node_modules/@google/model-viewer/dist/model-viewer.min.js',
  '3d-viewer/libs/model-viewer',
);
sh.cp(
  'node_modules/@google/model-viewer/LICENSE',
  '3d-viewer/libs/model-viewer',
);

sh.rm('-rf', 'ebook-viewer/libs');
sh.mkdir('ebook-viewer/libs/');
sh.mkdir('ebook-viewer/libs/epubjs');
sh.cp('node_modules/epubjs/dist/epub.min.js', 'ebook-viewer/libs/epubjs');
sh.cp('node_modules/epubjs/license', 'ebook-viewer/libs/epubjs');

sh.rm('-rf', 'json-editor/libs');
sh.mkdir('json-editor/libs/');
sh.mkdir('json-editor/libs/jsoneditor');
sh.mkdir('json-editor/libs/jsoneditor/img');
sh.cp(
  'node_modules/jsoneditor/dist/jsoneditor-minimalist.min.js',
  'json-editor/libs/jsoneditor',
);
sh.cp(
  'node_modules/jsoneditor/dist/jsoneditor.min.css',
  'json-editor/libs/jsoneditor',
);
sh.cp(
  'node_modules/jsoneditor/dist/img/jsoneditor-icons.svg',
  'json-editor/libs/jsoneditor/img',
);
sh.cp(
  'node_modules/jsoneditor/docs/shortcut_keys.md',
  'json-editor/libs/jsoneditor',
);
sh.cp('node_modules/jsoneditor/LICENSE', 'json-editor/libs/jsoneditor');

sh.rm('-rf', 'image-viewer/libs/tga.js/');
sh.mkdir('image-viewer/libs/tga.js');
sh.cp('node_modules/tga-js/LICENSE.md', 'image-viewer/libs/tga.js');
sh.cp('node_modules/tga-js/dist/umd/tga.js', 'image-viewer/libs/tga.js');

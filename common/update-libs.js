const sh = require('shelljs');

// cp('file1', 'dir1');
// cp('-R', 'path/to/dir/', '~/newCopy/');
// cp('-Rf', '/tmp/*', '/usr/local/*', '/home/tmp');
// cp('-Rf', ['/tmp/*', '/usr/local/*'], '/home/tmp'); // same as above

sh.rm('-rf', 'libs/jquery/');
sh.mkdir('libs/jquery');
sh.cp('-R', 'node_modules/jquery/dist', 'libs/jquery');
sh.cp('node_modules/jquery/LICENSE.txt', 'libs/jquery');

sh.rm('-rf', 'libs/jquery-i18next/');
sh.mkdir('libs/jquery-i18next');
sh.cp('node_modules/jquery-i18next/LICENSE', 'libs/jquery-i18next');
sh.cp('node_modules/jquery-i18next/jquery-i18next.js', 'libs/jquery-i18next');
sh.cp(
  'node_modules/jquery-i18next/jquery-i18next.min.js',
  'libs/jquery-i18next'
);

// sh.rm('-rf', 'libs/bootstrap/');
// sh.mkdir('libs/bootstrap');
// sh.cp('-R', 'node_modules/bootstrap/dist', 'libs/bootstrap');
// sh.cp('node_modules/bootstrap/LICENSE', 'libs/bootstrap');

// sh.rm('-rf', 'libs/bootswatch/');
// sh.mkdir('libs/bootswatch');
// sh.cp('-R', 'node_modules/bootswatch/paper', 'libs/bootswatch');
// sh.cp('-R', 'node_modules/bootswatch/fonts', 'libs/bootswatch');
// sh.cp('node_modules/bootswatch/LICENSE', 'libs/bootswatch');

sh.rm('-rf', 'libs/bootstrap5/');
sh.mkdir('libs/bootstrap5');
sh.cp('node_modules/bootstrap5/LICENSE', 'libs/bootstrap5');
sh.cp(
  'node_modules/bootstrap5/dist/js/bootstrap.bundle.min.js',
  'libs/bootstrap5'
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

sh.rm('-rf', 'libs/font-awesome/');
sh.mkdir('libs/font-awesome');
sh.cp('-R', 'node_modules/font-awesome/css', 'libs/font-awesome');
sh.cp('-R', 'node_modules/font-awesome/fonts', 'libs/font-awesome');
sh.cp('node_modules/bootswatch/README.md', 'libs/font-awesome');

sh.rm('-rf', 'libs/marked/');
sh.mkdir('libs/marked');
sh.cp('node_modules/marked/LICENSE.md', 'libs/marked');
sh.cp('node_modules/marked/marked.min.js', 'libs/marked');

sh.rm('-rf', 'libs/i18next/');
sh.mkdir('libs/i18next');
sh.cp('node_modules/i18next/LICENSE', 'libs/i18next');
sh.cp('node_modules/i18next/i18next.min.js', 'libs/i18next');
sh.cp('node_modules/i18next/i18next.js', 'libs/i18next');
sh.cp('node_modules/i18next/karma.backward.conf.js', 'libs/i18next');

sh.rm('-rf', 'libs/mousetrap/');
sh.mkdir('libs/mousetrap');
sh.cp('node_modules/mousetrap/README.md', 'libs/mousetrap');
sh.cp('node_modules/mousetrap/mousetrap.min.js', 'libs/mousetrap');
sh.cp('node_modules/mousetrap/mousetrap.js', 'libs/mousetrap');
sh.cp('-R', 'node_modules/mousetrap/plugins', 'libs/mousetrap');

sh.rm('-rf', 'libs/readability/');
sh.mkdir('libs/readability');
sh.cp('node_modules/readability/README.md', 'libs/readability');
sh.cp('node_modules/readability/JSDOMParser.js', 'libs/readability');
sh.cp('node_modules/readability/Readability.js', 'libs/readability');

sh.rm('-rf', 'html-editor/libs/summernote');
sh.mkdir('html-editor/libs/summernote');
sh.mkdir('html-editor/libs/summernote/dist');
sh.mkdir('html-editor/libs/summernote/dist/font');
sh.mkdir('html-editor/libs/summernote/dist/lang');
sh.cp('node_modules/summernote/README.md', 'html-editor/libs/summernote');
sh.cp('node_modules/summernote/LICENSE', 'html-editor/libs/summernote');
sh.cp(
  'node_modules/summernote/dist/font/*',
  'html-editor/libs/summernote/dist/font/'
);
sh.cp(
  'node_modules/summernote/dist/lang/*.js',
  'html-editor/libs/summernote/dist/lang/'
);
sh.cp(
  'node_modules/summernote/dist/summernote.css',
  'html-editor/libs/summernote/dist/summernote.css'
);
sh.cp(
  'node_modules/summernote/dist/summernote.min.js',
  'html-editor/libs/summernote/dist/summernote.min.js'
);

sh.rm('-rf', '3d-viewer/libs/');
sh.mkdir('3d-viewer/libs');
sh.mkdir('3d-viewer/libs/model-viewer');
sh.cp(
  'node_modules/@google/model-viewer/dist/model-viewer.min.js',
  '3d-viewer/libs/model-viewer'
);
sh.cp(
  'node_modules/@google/model-viewer/LICENSE',
  '3d-viewer/libs/model-viewer'
);
const sh = require('shelljs');

sh.rm('-rf', 'libs/codemirror/');
sh.mkdir('libs/codemirror');
sh.cp('node_modules/codemirror/LICENSE', 'libs/codemirror');
sh.cp('-R', 'node_modules/codemirror/addon/', 'libs/codemirror');
sh.cp('-R', 'node_modules/codemirror/lib/', 'libs/codemirror');
sh.cp('-R', 'node_modules/codemirror/mode/', 'libs/codemirror');
sh.cp('-R', 'node_modules/codemirror/theme/', 'libs/codemirror');

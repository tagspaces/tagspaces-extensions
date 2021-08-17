const sh = require('shelljs');

sh.mkdir('libs/codemirror');
sh.cp('-R', 'node_modules/codemirror', 'libs');

const fs = require('fs');
const path = require('path');

fs.readdir(path.join(__dirname), { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    reject(err);
    return;
  }

  const packageJson = fs.readFileSync(path.join(__dirname, 'package.json'));
  const rootPackageJson = JSON.parse(packageJson);

  // Filter subdirectories
  const subDirectories = files.filter(
    (file) =>
      file.isDirectory() &&
      !file.name.startsWith('.') &&
      file.name !== 'node_modules' &&
      file.name !== 'tagspacespro',
  );

  subDirectories.map((dir) => {
    const pluginJsonPath = path.join(__dirname, dir.name, 'package.json');
    try {
      const packageJsonContent = fs.readFileSync(pluginJsonPath);
      const packageJsonObj = JSON.parse(packageJsonContent);
      if (packageJsonObj.version !== rootPackageJson.version) {
        packageJsonObj.version = rootPackageJson.version;
        fs.writeFile(
          pluginJsonPath,
          JSON.stringify(packageJsonObj, null, 2),
          'utf8',
          () => {
            console.log(
              'Successfully update version:' + packageJsonObj.version,
            );
          },
        );
      }
    } catch (ex) {
      console.debug(
        'Update package.json version: ' + dir.name + ' error:' + ex.message,
      );
    }
  });
});

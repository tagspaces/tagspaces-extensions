const { execSync } = require('child_process');
const {
  existsSync,
  readdirSync,
  mkdirSync,
  statSync,
  copyFileSync,
  writeFileSync,
} = require('fs');
const { join } = require('path');

const pdfJSVersionTag = 'v5.4.530';

/**
 * Recursively copies files and directories from src to dest.
 *
 * @param {string} src - The source path.
 * @param {string} dest - The destination path.
 */
function copyRecursiveSync(src, dest) {
  const stats = statSync(src);
  if (stats.isDirectory()) {
    // Create the destination directory if it doesn't exist.
    if (!existsSync(dest)) {
      mkdirSync(dest);
    }
    // Read and copy each item in the directory.
    readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
    });
  } else if (!src.endsWith('.map') && !src.endsWith('.pdf')) {
    // For files, simply copy them.
    copyFileSync(src, dest);
  }
}

// Define directories relative to the project root.
const projectRoot = process.cwd();
const pdfjsDir = join(projectRoot, 'scripts', 'pdf.js');
const patchesDir = join(projectRoot, 'scripts', 'patches');
const destDir = join(projectRoot, 'generic');

// Helper function to run shell commands.
function run(command, options = {}) {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit', ...options });
}

// Clone the pdf.js repository if it doesn't exist.
if (!existsSync(pdfjsDir)) {
  console.log('Cloning pdf.js repository...');
  run(`git clone https://github.com/mozilla/pdf.js.git ${pdfjsDir}`);
}

// Change directory to the pdf.js repository.
process.chdir(pdfjsDir);
// console.log('Checking out master branch...');
// run('git checkout master');

console.log('Checking out specific tag ...');
// git checkout $(git describe --tags $(git rev-list --tags --max-count=1))
run('git checkout tags/' + pdfJSVersionTag);

// Apply patch files from the patches/pdfjs directory if they exist.
if (existsSync(patchesDir)) {
  const patchFiles = readdirSync(patchesDir).filter((file) =>
    file.endsWith('.patch'),
  );
  patchFiles.forEach((patchFile) => {
    const patchPath = join(patchesDir, patchFile);
    console.log(`Applying patch: ${patchFile}`);
    run(`git apply ${patchPath}`);
  });
} else {
  console.log(
    `No patches directory found at ${patchesDir} – skipping patching.`,
  );
}

// Install pdf.js dependencies and build.
console.log('Installing dependencies...');
run('npm install --force');
run('npm install -g gulp-cli --force');

console.log('Building pdf.js...');
run('gulp generic-legacy');

// Change back to the project root
process.chdir(projectRoot);

// Define the source directory for the build output.
const srcBuildDir = join(pdfjsDir, 'build', 'generic-legacy');
console.log(`Copying built files from ${srcBuildDir} to ${destDir}...`);

// rmSync(destDir, { recursive: true, force: true });
// Ensure the destination directory exists.
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}
// Use the helper function to recursively copy the build output.
copyRecursiveSync(srcBuildDir, destDir);

// Append build info file with pdf.js version
try {
  copyFileSync(
    join(pdfjsDir, 'build', 'version.json'),
    join(destDir, 'version.json'),
  );
} catch (error) {
  console.error('Error writing build info:', error);
}

console.log('pdf.js has been built and copied successfully.');

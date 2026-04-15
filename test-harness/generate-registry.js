#!/usr/bin/env node
/**
 * Generates registry.js by scanning extension directories for package.json
 * files with tsextension metadata, and inlining text-based test file contents.
 *
 * Usage:
 *   node generate-registry.js [--ext-dir ../path1] [--ext-dir ../path2]
 *
 * By default scans:
 *   - .. (the extensions directory)
 *   - ../../extensions-pro (if it exists, accessed via symlink at ../extensions-pro)
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const EXTENSIONS_DIR = path.resolve(SCRIPT_DIR, '..');
const TEST_FILES_DIR = path.join(SCRIPT_DIR, 'test-files');
const OUTPUT_FILE = path.join(SCRIPT_DIR, 'registry.js');

// Real path to extensions-pro (sibling of extensions/)
const EXTENSIONS_PRO_REAL = path.resolve(EXTENSIONS_DIR, '../extensions-pro');

// Symlink paths inside extensions/ so everything is under one server root
const EXTENSIONS_PRO_LINK = path.join(EXTENSIONS_DIR, 'extensions-pro');
const TAGSPACES_LINK_DIR = path.join(EXTENSIONS_DIR, '@tagspaces');
const TAGSPACES_LINK = path.join(TAGSPACES_LINK_DIR, 'extensions');

// Default directories to scan (relative to this script)
// Pro extensions are scanned via the symlink so entry points resolve under extensions/
const DEFAULT_DIRS = [
  { path: EXTENSIONS_DIR, source: 'community' },
  { path: EXTENSIONS_PRO_LINK, source: 'pro' },
];

// Directories to skip when scanning
const SKIP_DIRS = new Set([
  'node_modules', 'common', 'libs', 'deprecated', 'test-harness',
  '.git', '.ts', 'dist', '.github', 'extensions-pro', '@tagspaces',
]);

function parseArgs() {
  const args = process.argv.slice(2);
  const dirs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ext-dir' && args[i + 1]) {
      dirs.push({ path: path.resolve(args[++i]), source: 'custom' });
    }
  }
  return dirs.length > 0 ? dirs : DEFAULT_DIRS;
}

/**
 * Create symlinks inside extensions/ so that:
 * 1. extensions/extensions-pro -> ../extensions-pro
 *    (makes pro extensions accessible under the same server root)
 * 2. extensions/@tagspaces/extensions -> extensions/ itself
 *    (pro extensions reference ../../../@tagspaces/extensions/common/... etc.)
 */
function ensureSymlinks() {
  if (!fs.existsSync(EXTENSIONS_PRO_REAL)) {
    console.log('No extensions-pro directory found, skipping symlinks.\n');
    return;
  }

  // 1. Symlink extensions/extensions-pro -> ../extensions-pro
  createSymlinkIfNeeded(
    EXTENSIONS_PRO_LINK,
    EXTENSIONS_PRO_REAL,
    'extensions-pro (server access)',
  );

  // 2. Symlink extensions/@tagspaces/extensions -> extensions/
  //    Pro extensions at extensions-pro/ext-name/ reference
  //    ../../../@tagspaces/extensions/ which resolves to extensions/@tagspaces/extensions/
  fs.mkdirSync(TAGSPACES_LINK_DIR, { recursive: true });
  createSymlinkIfNeeded(
    TAGSPACES_LINK,
    EXTENSIONS_DIR,
    '@tagspaces/extensions (shared libs)',
  );
}

function createSymlinkIfNeeded(linkPath, targetPath, label) {
  if (fs.existsSync(linkPath)) {
    try {
      const existing = fs.readlinkSync(linkPath);
      const resolvedExisting = path.resolve(path.dirname(linkPath), existing);
      if (resolvedExisting === targetPath) return; // Already correct
      // Wrong target, remove and recreate
      fs.unlinkSync(linkPath);
    } catch {
      // Exists but not a symlink — don't touch it
      console.warn(`  ${linkPath} exists but is not a symlink, skipping ${label}`);
      return;
    }
  }

  try {
    fs.symlinkSync(targetPath, linkPath);
    console.log(`  Symlink: ${linkPath}\n       -> ${targetPath}  (${label})`);
  } catch (err) {
    console.warn(`  Could not create symlink for ${label}: ${err.message}`);
  }
}

function scanExtensionDir(dirInfo) {
  const { path: dirPath, source } = dirInfo;
  const extensions = [];

  if (!fs.existsSync(dirPath)) {
    console.log(`  Skipping (not found): ${dirPath}`);
    return extensions;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const extDir = path.join(dirPath, entry.name);
    const pkgPath = path.join(extDir, 'package.json');

    if (!fs.existsSync(pkgPath)) continue;

    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const tsext = pkg.tsextension;
      if (!tsext) continue;

      // Determine entry point
      let entryPoint = null;
      if (tsext.buildFolder) {
        const buildIndex = path.join(extDir, tsext.buildFolder, 'index.html');
        if (fs.existsSync(buildIndex)) {
          entryPoint = path.join(entry.name, tsext.buildFolder, 'index.html');
        }
      }
      if (!entryPoint) {
        const buildIndex = path.join(extDir, 'build', 'index.html');
        if (fs.existsSync(buildIndex)) {
          entryPoint = path.join(entry.name, 'build', 'index.html');
        }
      }
      if (!entryPoint) {
        const mainIndex = path.join(extDir, 'index.html');
        if (fs.existsSync(mainIndex)) {
          entryPoint = path.join(entry.name, 'index.html');
        }
      }
      if (!entryPoint) {
        console.log(`  Skipping (no index.html): ${entry.name}`);
        continue;
      }

      // Compute relative path from test-harness/ to the extension dir
      const relBase = path.relative(SCRIPT_DIR, dirPath);
      const relEntryPoint = path.join(relBase, entryPoint);

      // Extract file types
      const fileTypes = (tsext.fileTypes || []).map(ft => ft.ext);

      extensions.push({
        id: entry.name,
        name: tsext.name || entry.name,
        entryPoint: relEntryPoint,
        types: tsext.types || [],
        color: tsext.color || '',
        fileTypes,
        ...(source !== 'community' ? { source } : {}),
      });

      console.log(`  Found: ${entry.name} (${tsext.name}) [${fileTypes.join(', ')}]`);
    } catch (err) {
      console.error(`  Error reading ${pkgPath}: ${err.message}`);
    }
  }

  return extensions;
}

function readTestFiles() {
  const contents = {};

  if (!fs.existsSync(TEST_FILES_DIR)) {
    console.log('  Test files directory not found');
    return contents;
  }

  // Binary extensions that should not be inlined as text
  const BINARY_EXTS = new Set([
    '.tif', '.tiff', '.tga', '.psd', '.cr2', '.dng', '.nef', '.heic',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp', '.avif',
    '.pdf', '.docx', '.odt', '.epub', '.zip',
    '.mp3', '.mp4', '.ogg', '.wav', '.webm', '.flac', '.mkv', '.mov',
    '.msg', '.xlsx', '.xls', '.ods',
  ]);

  const files = fs.readdirSync(TEST_FILES_DIR);
  for (const file of files) {
    const filePath = path.join(TEST_FILES_DIR, file);
    if (!fs.statSync(filePath).isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    if (BINARY_EXTS.has(ext)) {
      console.log(`  Skip (binary): ${file}`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Use the full filename as key (e.g., "sample.marp.md", "sample.js")
      contents[file] = content;
      console.log(`  Read: ${file} (${content.length} chars)`);
    } catch (err) {
      console.error(`  Error reading ${file}: ${err.message}`);
    }
  }

  return contents;
}

function generateRegistryJS(extensions, testFiles) {
  const output = `// Auto-generated by generate-registry.js — do not edit manually
// Generated: ${new Date().toISOString()}

const EXTENSIONS_REGISTRY = ${JSON.stringify(extensions, null, 2)};

const TEST_FILE_CONTENTS = ${JSON.stringify(testFiles, null, 2)};
`;
  return output;
}

// Main
function main() {
  const scanDirs = parseArgs();

  // Ensure symlinks for pro extensions
  console.log('Checking symlinks...');
  ensureSymlinks();

  console.log('Scanning extension directories...');
  let allExtensions = [];
  for (const dir of scanDirs) {
    console.log(`\nDirectory: ${dir.path} (${dir.source})`);
    const found = scanExtensionDir(dir);
    allExtensions = allExtensions.concat(found);
  }

  // Sort by name
  allExtensions.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`\nReading test files...`);
  const testFiles = readTestFiles();

  console.log(`\nWriting ${OUTPUT_FILE}...`);
  const output = generateRegistryJS(allExtensions, testFiles);
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

  console.log(`\nDone! Found ${allExtensions.length} extensions, ${Object.keys(testFiles).length} test files.`);
}

main();

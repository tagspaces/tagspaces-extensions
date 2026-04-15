# TagSpaces Extension Test Harness

A mini web app for testing all TagSpaces extensions in iframes, configured exactly like the main TagSpaces application. Designed for quick manual testing and as a foundation for e2e tests.

## Quick Start

### Without a web server (simple mode)

```bash
cd test-harness
node generate-registry.js
# Open index.html directly in your browser (file:// protocol)
```

Text-based extensions (JSON Editor, HTML Viewer, Markdown Editor, Text Editor, etc.) work fully in this mode. URL-only extensions (Image Viewer, PDF Viewer, Media Player) load test files from GitHub.

### With a web server (full mode)

```bash
cd test-harness
bash serve.sh
# Opens at http://localhost:8080/test-harness/index.html
```

This regenerates the registry and starts a local HTTP server. All extensions work in this mode, including binary ones (MSG Viewer).

## How It Works

### Extension Registry

The registry is **generated dynamically** from `package.json` files — no manual extension list to maintain.

`generate-registry.js` scans extension directories, reads each `package.json` for the `tsextension` field, and produces `registry.js` containing:

- **`EXTENSIONS_REGISTRY`** — array of extension metadata (name, entry point, supported file types, color)
- **`TEST_FILE_CONTENTS`** — all text-based test file contents inlined as strings

The `registry.js` file is loaded via `<script>` tag, which works from both `file://` and `http://` protocols — no `fetch()` required for text-based extensions.

### Adding Extensions

By default, the generator scans:

- `../` (the extensions directory)
- `../../extensions-pro/` (if it exists)

To add custom directories:

```bash
node generate-registry.js --ext-dir /path/to/more/extensions
```

After adding or removing extensions, re-run `node generate-registry.js` to update the registry. Pro extensions appear in the sidebar with a **PRO** badge.

**Pro extensions shared libs:** Pro extensions reference shared libraries via `../../../@tagspaces/extensions/` (assuming a `node_modules` layout). The generator automatically creates two symlinks inside `extensions/` to make this work:

- `extensions/extensions-pro` -> `../extensions-pro` (makes pro extensions accessible under the server root)
- `extensions/@tagspaces/extensions` -> `extensions/` itself (so the `../../../@tagspaces/extensions/` path from pro extensions resolves to the community shared libs)

The server serves from the `extensions/` directory, keeping everything under one origin.

### Host Simulation

The harness simulates the TagSpaces host application by:

1. Loading extensions in a sandboxed iframe with the same `sandbox` and `allow` attributes as TagSpaces
2. Passing URL parameters: `file`, `locale`, `theme`, `primecolor`, `textcolor`, `bgndcolor`, `eventID`, `edit`, `readonly`
3. Listening for `postMessage` commands from extensions (`loadDefaultTextContent`, `loadDefaultBinaryContent`, `savingFile`, etc.)
4. Delivering content via `setContent()` or `postMessage()` depending on the extension

Special handling is built in for extensions with non-standard interfaces:

- **md-editor**: receives content via `postMessage({action: 'fileContent', content})`
- **text-editor**: `setContent(content, fileDir, editMode, theme)` (4 args)
- **json-editor, tiptap-editor, url-viewer**: `setContent(content, filePath, isViewMode)` (3 args)

### Test Files

The `test-files/` directory contains small, meaningful sample files for text-based formats. Each file has enough content to verify the extension renders correctly (headings, tables, code blocks, nested structures, etc.).

For binary formats (images, audio/video, DOCX, EPUB, etc.), the harness uses remote files from the [tagspaces/testdata](https://github.com/tagspaces/testdata) repository on GitHub.

## UI Controls

- **Theme**: Toggle between light and dark mode — reloads the extension with updated color parameters
- **Edit**: Toggle edit mode on/off — applies to editor extensions (MD Editor, Text Editor, etc.)
- **Locale**: Switch UI language (en, de, fr, es, zh-CN, ja)
- **Reload**: Reload the currently active extension

The **Message Log** panel at the bottom shows all `postMessage` traffic between the harness and the extension, useful for debugging.

## URL Parameters for Automation

Pre-select an extension and file type via URL parameters:

```
index.html?ext=json-editor&filetype=json&theme=dark&edit=true&locale=de
```

| Parameter  | Description                       | Example     |
| ---------- | --------------------------------- | ----------- |
| `ext`      | Extension ID (directory name)     | `md-editor` |
| `filetype` | File extension to test            | `md`        |
| `theme`    | `light` or `dark`                 | `dark`      |
| `edit`     | Enable edit mode (`true`/`false`) | `true`      |
| `locale`   | Language code                     | `de`        |

## E2E Test API

The harness exposes `window.testHarness` for programmatic control (e.g., from Playwright or Cypress):

```js
// Load an extension
window.testHarness.loadExtension('json-editor', 'json');

// Wait for a specific postMessage command
await window.testHarness.waitForMessage('loadDefaultTextContent', 5000);

// Inspect state and message log
window.testHarness.getState(); // { theme, editMode, activeExtension, ... }
window.testHarness.getMessageLog(); // [{ type, time, text, data }, ...]
window.testHarness.getRegistry(); // EXTENSIONS_REGISTRY array
window.testHarness.getIframe(); // the iframe DOM element
```

All sidebar items have `data-extension-id` and `data-filetype` attributes for easy CSS/DOM selectors in tests.

Custom DOM events are dispatched for key actions:

- `harness:extension-loaded` — when an extension iframe is created
- `harness:message-received` — when a postMessage is received from an extension
- `harness:content-delivered` — when content is delivered to an extension

## File Structure

```
test-harness/
  index.html              # Main test harness page
  generate-registry.js    # Registry generator script
  registry.js             # Generated (do not edit manually)
  serve.sh                # Convenience script: regenerate + serve
  README.md               # This file
  test-files/             # Sample files for testing
    sample.md             # Markdown with headings, lists, code, tables
    sample.html           # HTML with table, styles, links, images
    sample.json           # Nested JSON with various data types
    sample.csv            # 5-column, 10-row spreadsheet data
    sample.js             # JavaScript with class, async/await, ES modules
    sample.ts             # TypeScript with interfaces, generics, enums
    sample.py             # Python with dataclass, type hints, pathlib
    sample.css            # CSS with variables, grid, animations, media queries
    sample.xml            # XML with namespaces and attributes
    sample.yaml           # YAML configuration with nested structures
    sample.txt            # Plain text multi-paragraph document
    sample.sql            # DDL, DML, and complex queries
    sample.sh             # Shell script with functions and loops
    sample.url            # Windows URL shortcut format
    sample.canvas         # JSON Canvas format (nodes and edges)
    sample.marp.md        # Marp presentation slides
    sample.slides.md      # Reveal.js presentation slides
    sample.mmd            # Mindmap markdown (heading tree)
    sample.rtf            # Rich Text Format with formatting
    sample.pdf            # Minimal PDF with text content
```

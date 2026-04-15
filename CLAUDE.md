# Extensions

TagSpaces extensions are viewers and editors for various file formats. Each runs in a sandboxed iframe and communicates with the host via `postMessage`.

## Extension metadata

Each extension declares its capabilities in `package.json` under the `tsextension` field:

```json
"tsextension": {
  "name": "Display Name",
  "types": ["viewer", "editor"],
  "color": "#hexcolor",
  "fileTypes": [{ "ext": "md" }, { "ext": "mdx" }],
  "buildFolder": "build"
}
```

This is the source of truth for file type associations, extension type, and display info. The test harness generates its registry from these fields.

## Entry points

- Most extensions: `index.html` at the extension root
- Vite-built extensions (md-editor, text-editor, media-player): `build/index.html` (indicated by `buildFolder` in tsextension or presence of `build/index.html`)

## Host-extension communication

Extensions receive configuration via URL query parameters: `file`, `locale`, `theme`, `primecolor`, `textcolor`, `bgndcolor`, `eventID`, `edit`, `readonly`.

### Content delivery (host -> extension)

Extensions request content by sending a postMessage command, then receive it via a function call or message:

| Pattern | Extensions | Flow |
|---------|-----------|------|
| `setContent(content, fileDir)` | html-viewer, html-editor, mhtml-viewer, canvas-viewer, marp-viewer, mindmap-viewer, rtf-viewer, slides-viewer | Standard 2-arg |
| `setContent(content, fileDir, editMode, theme)` | text-editor | 4 args |
| `setContent(content, filePath, isViewMode)` | json-editor, tiptap-editor, url-viewer, contact-editor | 3 args with view mode |
| `postMessage({action:'fileContent', content})` | md-editor | Uses postMessage instead of setContent |
| URL-only (no setContent) | image-viewer, pdf-viewer, media-player, document-viewer, ebook-viewer, archive-viewer, spreadsheet-viewer | Extension fetches file directly from `?file=` param |

### Commands (extension -> host)

- `loadDefaultTextContent` / `parentLoadTextContent` — request text file content
- `loadDefaultBinaryContent` — request binary content
- `savingFile` — save with `{command, content}`
- `contentChangedInEditor` — notify content modified
- `editDocument` — request switch to edit mode
- `openLinkExternally` — open URL in browser
- `thumbnailGenerated` — return base64 thumbnail

## Shared libraries

Community extensions reference shared code at relative paths:
- `../common/common.js` — core utilities (sendMessageToHost, getParameterByName, i18n, etc.)
- `../libs/` — bootstrap, i18next, dompurify, etc.

Pro extensions (in `extensions-pro/`) reference these via `../../../@tagspaces/extensions/common/...` assuming a node_modules layout. A symlink at `extensions/@tagspaces/extensions` -> `extensions/` resolves this for local development.

## Pro extensions

Located in sibling directory `../extensions-pro/`. They use the same `tsextension` metadata format but add an `id` field (e.g., `@tagspacespro/extensions/3d-viewer`). Current pro extensions: 3d-viewer, contact-editor, dicom-viewer, einvoice-viewer, font-viewer.

## Test harness

`test-harness/` contains a test page that loads extensions in iframes with host simulation.

```bash
cd test-harness
node generate-registry.js   # scans package.json files, creates registry.js
bash serve.sh                # generates registry + starts HTTP server
```

- `generate-registry.js` scans `extensions/` and `extensions-pro/` (if present), creates symlinks for pro extension support, inlines text-based test files into `registry.js`
- Test files in `test-files/` — naming convention: `sample.{ext}` for default, `sample-{variant}.{ext}` for variants (auto-discovered in sidebar)
- Binary test files (tif, tga, psd, cr2, dng, nef, pdf) are local but not inlined in registry.js
- Server serves from `extensions/` directory at port 8080

## Build

- Root `package.json` has build scripts for Vite-based extensions: `npm run build-md-editor`, `npm run build-text-editor`, `npm run build-media-player`, `npm run build-pdf-viewer`
- pdf-viewer builds PDF.js from source with patches; version is specified as `pdfjs-dist` dependency in its package.json

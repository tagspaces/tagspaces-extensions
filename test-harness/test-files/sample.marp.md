---
marp: true
theme: default
paginate: true
---

# TagSpaces Extensions

A guide to the extension ecosystem

---

## What are Extensions?

- Viewers and editors for various file formats
- Run in sandboxed iframes
- Communicate via postMessage API
- Support theming (light/dark)

---

## Extension Types

### Viewers
Read-only display of file content
- Image Viewer, PDF Viewer, HTML Viewer

### Editors
Full editing capabilities
- Markdown Editor, Text Editor, HTML Editor

---

## Architecture

```
Host (TagSpaces)
  |-- iframe (Extension)
  |     |-- postMessage → loadDefaultTextContent
  |     |-- setContent(content, fileDir)
  |     |-- postMessage → savingFile
```

---

## Supported Formats

| Category | Formats |
|----------|---------|
| Documents | PDF, DOCX, EPUB, RTF |
| Images | JPG, PNG, GIF, SVG |
| Code | JS, PY, TS, CSS |
| Data | JSON, CSV, YAML |

---

# Thank You!

Learn more at [tagspaces.org](https://www.tagspaces.org)

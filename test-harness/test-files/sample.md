---
title: Sample Markdown Document
author: TagSpaces Team
date: 2025-04-15
tags: [test, sample, markdown]
description: A sample markdown file for testing the TagSpaces MD Editor extension
---

# Sample Markdown Document

## Images

### Inline Data URL (blue square)

![Blue square](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGNQnPYZK2IYWhIAaK9qgeCqq88AAAAASUVORK5CYII=)

### Remote Image (from test repo)

![Remote GIF](https://raw.githubusercontent.com/tagspaces/testdata/master/file-structure/supported-filestypes/sample.gif)

### Relative Path Image (AVIF)

![Local AVIF](sample.avif)

## Introduction

This is a **bold** statement and this is *italic*. Here is some `inline code` and a [link to TagSpaces](https://www.tagspaces.org).

## Features List

- Item one with **bold text**
- Item two with *italic text*
- Item three with `code`
  - Nested item A
  - Nested item B

## Ordered List

1. First step
2. Second step
3. Third step

## Code Block

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

const result = greet('TagSpaces');
console.log(result);
```

## Table

| Name       | Type     | Description          |
|------------|----------|----------------------|
| id         | number   | Unique identifier    |
| title      | string   | Document title       |
| created    | date     | Creation timestamp   |
| tags       | string[] | Associated tags      |

## Blockquote

> TagSpaces is a free, no vendor lock-in, open source application
> for organizing, annotating and managing local files.

## Horizontal Rule

---

## Task List

- [x] Create sample markdown
- [x] Add inline image
- [x] Add remote image
- [x] Add relative path image
- [ ] Verify all features

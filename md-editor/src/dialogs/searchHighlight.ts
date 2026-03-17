const HIGHLIGHT_ALL = 'ts-search-all';
const HIGHLIGHT_CURRENT = 'ts-search-current';

const supportsHighlightAPI =
  typeof CSS !== 'undefined' && 'highlights' in CSS;

export function collectTextNodes(node: Node, out: Node[] = []): Node[] {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(node);
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      collectTextNodes(node.childNodes[i], out);
    }
  }
  return out;
}

export function findAllRanges(
  container: HTMLElement,
  searchText: string,
  caseSensitive: boolean,
): Range[] {
  if (!searchText) return [];
  const needle = caseSensitive ? searchText : searchText.toLowerCase();
  const ranges: Range[] = [];
  for (const node of collectTextNodes(container)) {
    const hay = caseSensitive
      ? node.nodeValue!
      : node.nodeValue!.toLowerCase();
    let offset = 0;
    let idx: number;
    while ((idx = hay.indexOf(needle, offset)) !== -1) {
      const r = document.createRange();
      r.setStart(node, idx);
      r.setEnd(node, idx + searchText.length);
      ranges.push(r);
      offset = idx + searchText.length;
    }
  }
  return ranges;
}

export function applyHighlights(allRanges: Range[], currentRange?: Range): void {
  if (!supportsHighlightAPI) return;
  const h = (CSS as any).highlights;
  if (allRanges.length > 0) {
    h.set(HIGHLIGHT_ALL, new (window as any).Highlight(...allRanges));
  } else {
    h.delete(HIGHLIGHT_ALL);
  }
  if (currentRange) {
    h.set(HIGHLIGHT_CURRENT, new (window as any).Highlight(currentRange));
  } else {
    h.delete(HIGHLIGHT_CURRENT);
  }
}

export function clearHighlights(): void {
  if (!supportsHighlightAPI) return;
  const h = (CSS as any).highlights;
  h.delete(HIGHLIGHT_ALL);
  h.delete(HIGHLIGHT_CURRENT);
}

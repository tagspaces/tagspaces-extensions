export class HtmlSearcher {
  private nodes: Node[] = [];
  private currentNodeIndex: number = 0;
  private currentOffset: number = 0;

  constructor(private container: HTMLElement) {
    if (!this.container) {
      console.error(`Container not found.`);
    } else {
      this.collectTextNodes(this.container);
    }
  }

  public searchAndSelect(
    searchText: string,
    caseSensitive: boolean = false,
  ): boolean {
    if (!this.container || this.nodes.length === 0) {
      console.error(`Container not found or empty.`);
      return false;
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges(); // Clear any existing selection.
    }

    let found = this.searchInNodes(searchText, caseSensitive);

    // If not found, reset and search from the beginning.
    if (!found) {
      this.currentNodeIndex = 0;
      this.currentOffset = 0;
      found = this.searchInNodes(searchText, caseSensitive);
    }

    if (!found) {
      console.log(`Text "${searchText}" not found in container.`);
    }

    return found;
  }

  private collectTextNodes(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      this.nodes.push(node);
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        this.collectTextNodes(node.childNodes[i]);
      }
    }
  }

  private searchInNodes(searchText: string, caseSensitive: boolean): boolean {
    const searchStr = caseSensitive ? searchText : searchText.toLowerCase();

    for (; this.currentNodeIndex < this.nodes.length; this.currentNodeIndex++) {
      const node = this.nodes[this.currentNodeIndex];
      const text = caseSensitive
        ? node.nodeValue
        : node.nodeValue?.toLowerCase();

      if (text) {
        const startIndex =
          this.currentNodeIndex === this.currentNodeIndex
            ? this.currentOffset
            : 0;
        const index = text.indexOf(searchStr, startIndex);
        if (index !== -1) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + searchText.length);
          const selection = window.getSelection();
          if (selection) {
            selection.addRange(range);
          }

          this.currentOffset = index + searchText.length;

          return true;
        }
      }

      // Reset currentOffset when moving to the next node.
      this.currentOffset = 0;
    }

    return false;
  }
}

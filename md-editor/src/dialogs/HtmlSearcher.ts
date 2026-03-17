import { findAllRanges, applyHighlights, clearHighlights } from './searchHighlight';

export class HtmlSearcher {
  private allRanges: Range[] = [];
  private currentIndex: number = -1;

  constructor(private container: HTMLElement) {
    if (!this.container) {
      console.error('Container not found.');
    }
  }

  public searchAndSelect(
    searchText: string,
    caseSensitive: boolean = false,
  ): boolean {
    if (!this.container || !searchText) {
      clearHighlights();
      return false;
    }

    // Rebuild ranges each call so DOM changes (lazy images, etc.) are reflected
    this.allRanges = findAllRanges(this.container, searchText, caseSensitive);

    if (this.allRanges.length === 0) {
      clearHighlights();
      console.log(`Text "${searchText}" not found.`);
      return false;
    }

    // Advance to next match, wrapping around
    this.currentIndex = (this.currentIndex + 1) % this.allRanges.length;
    const current = this.allRanges[this.currentIndex];

    applyHighlights(this.allRanges, current);

    // Scroll current match into view
    const el = current.startContainer.parentElement;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });

    // Fallback for browsers without CSS Highlight API: native selection
    if (typeof CSS === 'undefined' || !('highlights' in CSS)) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(current.cloneRange());
      }
    }

    return true;
  }

  public clear(): void {
    clearHighlights();
    this.allRanges = [];
    this.currentIndex = -1;
  }
}

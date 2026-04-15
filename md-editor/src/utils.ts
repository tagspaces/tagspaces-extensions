import { Ctx } from '@milkdown/ctx';
import { editorViewOptionsCtx } from '@milkdown/kit/core';
import { Crepe } from '@milkdown/crepe';
import AppConfig from '@tagspaces/tagspaces-common/AppConfig';
import { remarkPreserveEmptyLinePlugin } from '@milkdown/preset-commonmark';
import { trailing } from '@milkdown/kit/plugin/trailing';

export function parseFrontmatter(content: string): {
  frontmatter: string | null;
  body: string;
} {
  if (!content) return { frontmatter: null, body: '' };

  // Strip UTF-8 BOM if present
  const stripped = content.startsWith('\uFEFF') ? content.slice(1) : content;

  // Normalize line endings to \n for consistent parsing
  const normalized = stripped.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (!normalized.startsWith('---\n') && normalized !== '---') {
    return { frontmatter: null, body: stripped };
  }

  const closeIndex = normalized.indexOf('\n---', 4);
  if (closeIndex === -1) {
    return { frontmatter: null, body: stripped };
  }

  // Accept closing --- followed by \n, end-of-string, or whitespace only
  const afterDashes = normalized.slice(closeIndex + 4);
  if (afterDashes.length > 0 && afterDashes[0] !== '\n' && afterDashes[0] !== ' ' && afterDashes[0] !== '\t') {
    // This \n--- is not a proper closing delimiter (e.g. inside a value)
    return { frontmatter: null, body: stripped };
  }

  const frontmatter = normalized.slice(4, closeIndex).trim();
  const body = afterDashes.startsWith('\n') ? afterDashes.slice(1) : afterDashes;
  return { frontmatter: frontmatter || null, body };
}

export function combineFrontmatter(
  frontmatter: string | null,
  body: string,
): string {
  if (!frontmatter) return body;
  return `---\n${frontmatter}\n---\n${body}`;
}

export function getParameterByName(paramName: string) {
  const name = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  let param =
    results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  if (param.includes('#')) {
    param = param.split('#').join('%23');
  }
  return param;
}

export function sendMessageToHost(message: any) {
  window.parent.postMessage(
    JSON.stringify({ ...message, eventID: getParameterByName('eventID') }),
    '*',
  );
}

/*function hasURLProtocol(url: any) {
  // noinspection OverlyComplexBooleanExpressionJS
  return (
    url &&
    (url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('file://') ||
      url.startsWith('data:') ||
      url.startsWith('ts://?ts') ||
      url.startsWith('ts:?ts'))
  );
}*/

/*export function handleClick(
  mode: string,
  ctx: Ctx,
  view: EditorView,
  pos: number,
): boolean {
  console.log('handle click');
  // event.preventDefault();
  if (mode === 'preview') {
    const found = view.state.tr.doc.nodeAt(pos);
    if (found && found.marks.length > 0) {
      const mark = found.marks.find(
        ({ type }) => type === linkSchema.type(ctx),
      );
      const href = mark?.attrs.href;
      if (href) {
        let path;
        if (hasURLProtocol(href)) {
          path = href;
        } else {
          path = encodeURIComponent(href);
        }
        window.parent.postMessage(
          JSON.stringify({
            command: 'openLinkExternally',
            link: path,
          }),
          '*',
        );
      }
      return true;
    }
  }
  return false;
}*/

let _linkTooltip: HTMLElement | null = null;

function getLinkTooltip(): HTMLElement {
  if (!_linkTooltip || !document.body.contains(_linkTooltip)) {
    _linkTooltip = document.createElement('div');
    _linkTooltip.style.cssText =
      'position:fixed;background:#333333;color:#fff;padding:3px 8px;border-radius:10px;' +
      'font-size:12px;font-family: Helvetica, Arial, sans-serif;pointer-events:none;z-index:9999;max-width:480px;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:none;';
    document.body.appendChild(_linkTooltip);
  }
  return _linkTooltip;
}

function showLinkTooltip(href: string, x: number, y: number) {
  const tip = getLinkTooltip();
  tip.textContent = href;
  tip.style.left = `${x + 14}px`;
  tip.style.top = `${y + 14}px`;
  tip.style.display = 'block';
}

function hideLinkTooltip() {
  if (_linkTooltip) _linkTooltip.style.display = 'none';
}

/**
 * Resolves a relative path against a base folder path.
 * Handles '../' and './' traversal.
 */
function resolveRelativePath(baseFolderPath: string, relativePath: string): string {
  const separator = baseFolderPath.includes('\\') ? '\\' : '/';
  const baseParts = baseFolderPath.replace(/\\/g, '/').split('/').filter(Boolean);
  const relParts = relativePath.replace(/\\/g, '/').split('/');

  for (const part of relParts) {
    if (part === '..') {
      baseParts.pop();
    } else if (part !== '.') {
      baseParts.push(part);
    }
  }

  const joined = baseParts.join(separator);
  return baseFolderPath.startsWith('/') ? '/' + joined : joined;
}

export function createCrepeEditor(
  root: HTMLElement,
  defaultContent: string,
  defaultEditMode: boolean,
  features?: {}, //[Crepe.Feature.CodeMirror]: false,
  placeholder?: string,
  currentFolder?: string,
  openLink?: (url: string, options?: any) => void,
  onChange?: (markdown: string, prevMarkdown: string) => void,
  onFocus?: () => void,
): Crepe {
  const crepe = new Crepe({
    root,
    defaultValue: defaultContent || '',
    features: features,
    featureConfigs: {
      [Crepe.Feature.Placeholder]: {
        text:
          placeholder === undefined
            ? 'Type / to use slash command'
            : placeholder,
      },
      [Crepe.Feature.ImageBlock]: {
        proxyDomURL: (originalURL: string) => {
          if (originalURL.length === 0) {
            return '';
          }
          if (
            currentFolder &&
            !originalURL.startsWith('data:') &&
            !originalURL.startsWith('blob') &&
            !originalURL.startsWith('http')
          ) {
            const isWeb = document.URL.startsWith('http') && !document.URL.startsWith('http://localhost:1212/');
            if (isWeb) {
              return currentFolder + '/' + originalURL;
            }
            return (
              AppConfig.mediaProtocol + `:///${currentFolder}/${originalURL}`
            );
          }
          return originalURL;
        },
        onUpload: async (file: File) => {
          const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB
          if (file.size > MAX_IMAGE_SIZE) {
            throw new Error('Image file exceeds the 15 MB limit.');
          }
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          return base64String;
        },
      },
    },
  });
  crepe.editor.remove(remarkPreserveEmptyLinePlugin);
  crepe.editor.remove(trailing);
  crepe.editor.config((ctx: Ctx) => {
    ctx.update(editorViewOptionsCtx, (prev) => ({
      ...prev,
      editable: () => defaultEditMode,
      attributes: {
        class: 'mx-auto full-height',
      },
      handleDOMEvents: {
        click: (view, event) => {
          if (!view.editable && openLink) {
            const target = event.target as HTMLElement;
            if (target.tagName === 'A') {
              const href = (target as HTMLAnchorElement).getAttribute('href');
              if (href && !href.startsWith('#')) {
                event.preventDefault();
                // Block dangerous protocols before forwarding to host
                let resolvedHref = href;
                if (currentFolder && !href.includes('://') && !href.startsWith('/')) {
                  const absolutePath = resolveRelativePath(currentFolder, href);
                  resolvedHref = 'ts://?cmdopen=' + encodeURIComponent(absolutePath);
                }
                try {
                  const parsed = new URL(resolvedHref, window.location.href);
                  const safe = ['http:', 'https:', 'mailto:', 'ts:', 'tel:'].includes(parsed.protocol);
                  if (safe) {
                    openLink(resolvedHref, { fullWidth: false });
                  }
                } catch {
                  openLink(resolvedHref, { fullWidth: false });
                }
                return true;
              }
            }
          }
          return false;
        },
        mouseover: (view, event) => {
          if (!view.editable) {
            const anchor = (event.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
            if (anchor) {
              const href = anchor.getAttribute('href');
              if (href && !href.startsWith('#')) {
                showLinkTooltip(href, event.clientX, event.clientY);
                return false;
              }
            }
            hideLinkTooltip();
          }
          return false;
        },
        mousemove: (view, event) => {
          if (!view.editable && _linkTooltip && _linkTooltip.style.display === 'block') {
            _linkTooltip.style.left = `${event.clientX + 14}px`;
            _linkTooltip.style.top = `${event.clientY + 14}px`;
          }
          return false;
        },
        mouseout: (view, event) => {
          if (!view.editable) {
            const anchor = (event.target as HTMLElement).closest('a');
            if (anchor) hideLinkTooltip();
          }
          return false;
        },
      },
      /*handleClickOn: (view: EditorView, pos: number) => {
        if (!view.editable) {
          const href = getHref(ctx, view, pos);
          if (href && openLink) {
            openLink(href, { fullWidth: false });
            return true;
          }
        }
        return false;
      },*/
    }));
  });

  if (onChange || onFocus) {
    crepe.on((listener) => {
      listener.markdownUpdated((_, markdown: string, prevMarkdown: string) => {
        //const view = crepe.editor.ctx.get(editorViewCtx);
        //if (view && view.hasFocus()) {
        // console.log('Change listener:' + markdown);
        if (onChange) {
          onChange(markdown, prevMarkdown);
        }
        //}
      });
      listener.focus(() => {
        if (onFocus) {
          onFocus();
        }
      });
    });
  }
  crepe.setReadonly(!defaultEditMode);

  return crepe;
}
/*
function getHref(ctx: Ctx, view: EditorView, pos: number): string | undefined {
  const found = view.state.tr.doc.nodeAt(pos);
  if (found && found.marks.length > 0) {
    const mark = found.marks.find(({ type }) => type === linkSchema.type(ctx));
    return mark?.attrs.href;
  }
  return undefined;
}*/

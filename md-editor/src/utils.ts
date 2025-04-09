import { EditorView } from 'prosemirror-view';
import { linkSchema } from '@milkdown/preset-commonmark';
import { Ctx } from '@milkdown/ctx';
import { editorViewOptionsCtx } from '@milkdown/kit/core';
import { Crepe } from '@milkdown/crepe';
import AppConfig from '@tagspaces/tagspaces-common/AppConfig';

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

function hasURLProtocol(url: any) {
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
}

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

export function createCrepeEditor(
  root: HTMLElement,
  defaultContent: string,
  defaultEditMode: boolean,
  features?: {}, //[Crepe.Feature.CodeMirror]: false,
  placeholder?: string,
  currentFolder?: string,
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
            return (
              AppConfig.mediaProtocol + `:///${currentFolder}/${originalURL}`
            );
          }
          return originalURL;
        },
      },
    },
  });
  crepe.editor.config((ctx: Ctx) => {
    ctx.update(editorViewOptionsCtx, (prev) => ({
      ...prev,
      attributes: {
        class: 'mx-auto full-height',
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

function getHref(ctx: Ctx, view: EditorView, pos: number): string | undefined {
  const found = view.state.tr.doc.nodeAt(pos);
  if (found && found.marks.length > 0) {
    const mark = found.marks.find(({ type }) => type === linkSchema.type(ctx));
    return mark?.attrs.href;
  }
  return undefined;
}

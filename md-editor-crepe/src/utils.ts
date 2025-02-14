import { EditorView } from 'prosemirror-view';
import { linkSchema } from '@milkdown/preset-commonmark';
import { Ctx } from '@milkdown/ctx';

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

export function handleClick(
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
}

export function sendMessageToHost(message: any) {
  window.parent.postMessage(
    // @ts-ignore
    JSON.stringify({ ...message, eventID: window.eventID }),
    '*'
  );
}

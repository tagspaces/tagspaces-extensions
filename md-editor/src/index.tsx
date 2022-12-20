import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './App';

function sendMessageToHost(message: any) {
  window.parent.postMessage(JSON.stringify(message), '*');
}
// mdContent is not received without this message.
sendMessageToHost({ command: 'loadDefaultTextContent' });

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

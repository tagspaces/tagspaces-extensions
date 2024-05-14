import React from 'react';
import { render } from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { MUIThemeProvider } from '@tagspaces/tagspaces-extension-ui';
import i18n from './i18n';
import App from './App';
import { sendMessageToHost } from './utils';

// mdContent is not received without this message.
sendMessageToHost({ command: 'loadDefaultTextContent' });

// @ts-ignore
i18n.changeLanguage(window.locale);

const container = document.getElementById('root') as HTMLElement;
//const root = ReactDOM.createRoot(container);
//if (root) {
render(
  <React.StrictMode>
    <MUIThemeProvider>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </MUIThemeProvider>
  </React.StrictMode>,
  container
);
/*
} else {
  console.error('Element with id "root" not found.');
}
*/

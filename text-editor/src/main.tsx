import React from 'react';
import ReactDOM from 'react-dom/client';
import { Editor } from './components/Editor';
import { MUIThemeProvider } from '@tagspaces/tagspaces-extension-ui';

import { sendMessageToHost } from './utils';

// mdContent is not received without this message.
sendMessageToHost({ command: 'loadDefaultTextContent' });

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <MUIThemeProvider>
      <Editor />
    </MUIThemeProvider>
  </React.StrictMode>
);

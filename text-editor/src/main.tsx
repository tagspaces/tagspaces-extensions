import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './components/App';
import { Editor } from './components/Editor';
import './userWorker';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <App>
    <React.StrictMode>
      <Editor />
    </React.StrictMode>
  </App>
);

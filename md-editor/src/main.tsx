import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { getParameterByName } from './utils';
import App from './App';
import './i18n';
import { MUIThemeProvider } from '@tagspaces/tagspaces-extension-ui';

const root$ = document.getElementById('app');
if (!root$) throw new Error('No root element found');

const root = createRoot(root$);
const isEditModeParam = getParameterByName('edit');
// Treat only explicit 'true' / '1' as edit mode — avoids 'false' string being truthy
const isEditMode = isEditModeParam === 'true' || isEditModeParam === '1';
const readOnly = getParameterByName('readonly');
const theme = getParameterByName('theme');
const file = getParameterByName('file');

const primaryColor = getParameterByName('primecolor').replace('%23', '#');
const textColor = getParameterByName('textcolor').replace('%23', '#');

root.render(
  <StrictMode>
    <MUIThemeProvider primaryColor={primaryColor} primaryTextColor={textColor}>
      <App
        isEditMode={isEditMode}
        readOnly={!!readOnly}
        theme={theme}
        file={file}
      />
    </MUIThemeProvider>
  </StrictMode>,
);

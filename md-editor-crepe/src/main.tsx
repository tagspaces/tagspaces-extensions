import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MilkdownEditor } from './Editor';
import { MilkdownProvider } from '@milkdown/react';
import { getParameterByName } from './utils';

const root$ = document.getElementById('app');
if (!root$) throw new Error('No root element found');

const root = createRoot(root$);
const isEditMode = getParameterByName('edit');
const readOnly = getParameterByName('readonly');
const theme = getParameterByName('theme');

root.render(
  <StrictMode>
    <MilkdownProvider>
      <MilkdownEditor
        isEditMode={!!isEditMode}
        readOnly={!!readOnly}
        theme={theme}
      />
    </MilkdownProvider>
  </StrictMode>,
);

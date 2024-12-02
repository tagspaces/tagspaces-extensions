import React from 'react';

import ReactDOM from 'react-dom/client';

import { Player } from './player';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Player />
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function sendMessageToHost(message: any) {
  window.parent.postMessage(JSON.stringify(message), '*');
}

sendMessageToHost({ command: 'loadDefaultTextContent' });

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

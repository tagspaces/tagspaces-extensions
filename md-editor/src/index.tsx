import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { sendMessageToHost } from '../../extcommon';

// var setContent = (content: any, fileDirectory: string) => {
//   alert(content);
// };

sendMessageToHost({ command: 'loadDefaultTextContent' });

// ReactDOM.render(<h1>Hello world!</h1>, document.getElementById('root'));
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

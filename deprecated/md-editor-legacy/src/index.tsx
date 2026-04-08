import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './App';
import { sendMessageToHost } from './utils';

// mdContent is not received without this message.
sendMessageToHost({ command: 'loadDefaultTextContent' });

// @ts-ignore
i18n.changeLanguage(window.locale);

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

{
  /* <table id="markdownHelpModal">
<tbody>
  <tr>
    <td><strong>Bold</strong></td>
    <td>**bold**</td>
  </tr>
  <tr>
    <td><i>Italics</i></td>
    <td>*italics*</td>
  </tr>
  <tr>
    <td>
      <del>Strikethrough</del>
    </td>
    <td>~~strikethrough~~</td>
  </tr>
  <tr>
    <td>Header</td>
    <td># H1 ## H2 ### H3</td>
  </tr>
  <tr>
    <td>
      <li>item</li>
    </td>
    <td>* item</td>
  </tr>
  <tr>
    <td>Blockquote</td>
    <td>&gt; blockquote</td>
  </tr>
  <tr>
    <td>
      <a
        href="https://www.youtube.com/watch?v=8rMo5EFAqgM"
        target="_blank"
        >Link</a
      >
    </td>
    <td>[title](http://)</td>
  </tr>
  <tr>
    <td>Image</td>
    <td>![alt](http://)</td>
  </tr>
  <tr>
    <td><code>code</code></td>
    <td>`code`</td>
  </tr>
  <tr>
    <td>
      <pre
        style="display: inline-block; margin: 4px 0"
      ><code><span class="keyword">var </span>code = <span
    class="string">"formatted"</span>;</code></pre>
    </td>
    <td style="line-height: 100%">
      ```
      <i style="color: rgba(0,0,0,0.5)"
        >(for line break click shift+enter)</i
      ><br />var code = "formatted";<br />```
    </td>
  </tr>
</tbody>
</table> */
}

import React, { useReducer, useState, useEffect } from 'react';
import useEventListener from './useEventListener';
// @ts-ignore
import EasySpeech from 'easy-speech';
import './extension.css';
// import MainMenu from './MainMenu';
import {
  CodeMirror,
  CodeMirrorRef
} from '@tagspaces/tagspaces-codemirror';
import { sendMessageToHost } from './utils';

const App: React.FC = () => {
  //const rate = React.useRef<number>(getDefaultRate());
  const focusCode = React.useRef(false);
  const focus = React.useRef(false);
  const contentRef = React.useRef(null);
  const codeMirrorRef = React.useRef<CodeMirrorRef>(null);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
 //const [isFilterVisible, setFilterVisible] = useState<boolean>(false);

  // @ts-ignore
  const isDarkMode = window.theme && window.theme === 'dark';
  // @ts-ignore
  const readOnly = () => !window.editMode;
  // @ts-ignore
  const getContent = () => window.mdContent;

  // @ts-ignore
  useEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 's') {
        event.stopPropagation();
        event.preventDefault();
        if (!readOnly()) {
          sendMessageToHost({ command: 'saveDocument' });
        }
      } else if (event.key.toLowerCase() === 'p') {
        event.stopPropagation();
        event.preventDefault();
        window.print();
        // } else if (event.key.toLowerCase() === 'f') {
        //   setFilterVisible(!isFilterVisible);
      }
    }
    // if (event.key.toLowerCase() === 'escape') {
    //   setFilterVisible(false);
    // }
  });

  // @ts-ignore
  useEventListener('dblclick', event => {
    if (readOnly()) {
      sendMessageToHost({ command: 'editDocument' });
    }
  });

  useEventListener('themeChanged', () => {
    forceUpdate();
  });

  useEventListener('contentLoaded', () => {
    forceUpdate();
  });

  const onCodeChange = React.useCallback((getCode: () => string) => {
    const value = getCode();
    updateContent(value);
  }, []);

  const updateContent = (content: string) => {
    if (focus.current || focusCode.current) {
      // @ts-ignore
      window.mdContent = content;
      // console.log('content changed:' + content);
      // @ts-ignore
      window.editMode = true;
      // TODO send only contentChangedInEditor and auto enable editDocument in Tagspaces
      /*window.parent.postMessage(
          JSON.stringify({ command: 'editDocument' }),
          '*'
      );*/
      sendMessageToHost({
        command: 'contentChangedInEditor'
        // filepath: filePath
      });
    }
  };

  return (
    <div>
      {getContent() !== undefined && (
        <div ref={contentRef}>
          <div style={{ width: '100%', height: '100%' }}>
            <CodeMirror
              ref={codeMirrorRef}
              value={getContent()}
              onChange={onCodeChange}
              dark={isDarkMode}
              editable={!readOnly()}
              lock={focusCode}
            />
          </div>
        </div>
      )}
      {/*<MainMenu />*/}
    </div>
  );
};

export default App;

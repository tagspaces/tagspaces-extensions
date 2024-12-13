import React, { useContext, useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  ColorModeContext,
  MainMenu,
  useEventListener,
} from '@tagspaces/tagspaces-extension-ui';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { sendMessageToHost } from '../utils';

export const Editor: React.FC = () => {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef<HTMLDivElement | null>(null);
  //const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  //const modelRef = useRef<monaco.editor.ITextModel | null>(null);
  const colorMode = useContext(ColorModeContext);
  // @ts-ignore
  const readOnly = () => !window.editMode;
  // @ts-ignore
  const getContent = () => window.fileContent || '';
  //const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  // @ts-ignore
  const isDarkMode = window.theme && window.theme === 'dark';
  // @ts-ignore
  const filePath = window.filePath;

  useEventListener('contentLoaded', () => {
    console.log('contentLoaded: event triggered');
    initEditor();
  });

  useEventListener('themeChanged', () => {
    console.log('themeChanged: event triggered');
    //forceUpdate();
    if (monacoEl.current) {
      // @ts-ignore
      console.log('themeChanged: ' + window.theme + ' event triggered');
      // @ts-ignore
      colorMode.setMode(window.theme === 'dark' ? 'dark' : 'light');
    }
  });

  function initEditor() {
    if (editor) {
      setReadOnly();
      // setLanguage();
      editor.setValue(getContent());
    }
  }

  function setReadOnly() {
    if (editor) {
      const isReadOnly = editor
        .getOptions()
        .get(monaco.editor.EditorOption.readOnly);
      if (isReadOnly !== readOnly()) {
        editor.updateOptions({ readOnly: readOnly() });
      }
    }
  }

  /* function setLanguage(){
    if(modelRef.current && filePath) {

      monaco.editor.setModelLanguage(modelRef.current as monaco.editor.ITextModel, getLanguage());
    }
  }*/

  function getLanguage() {
    if (
      filePath.endsWith('.js') ||
      filePath.endsWith('.jsx') ||
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx')
    ) {
      return 'javascript';
    } else if (
      filePath.endsWith('.css') ||
      filePath.endsWith('.scss') ||
      filePath.endsWith('.less')
    ) {
      return 'css';
    } else if (
      filePath.endsWith('.html') ||
      filePath.endsWith('.xhtml') ||
      filePath.endsWith('.handlebars') ||
      filePath.endsWith('.razor')
    ) {
      return 'html';
    } else if (filePath.endsWith('.json')) {
      return 'json';
    }
    return 'plaintext';
  }

  const editorOption = {
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fixedOverflowWidgets: true,
    theme: isDarkMode ? 'vs-dark' : 'light',
    language: getLanguage(), //'javascript',
    minimap: {
      enabled: false,
    },
    readOnly: readOnly(),
  } as monaco.editor.IEditorConstructionOptions;

  useEffect(() => {
    if (monacoEl.current) {
      setEditor((editor) => {
        if (editor) {
          initEditor();
          return editor;
        }

        // modelRef.current = monaco.editor.createModel(getContent(), getLanguage());

        const monacoEditor = monaco.editor.create(monacoEl.current!, {
          value: getContent(),
          // model: modelRef.current,
          ...editorOption,
        });
        monacoEditor.onDidChangeModelContent(() => {
          const model = monacoEditor.getModel();
          if (model) {
            const fileContent = model.getValue();
            // @ts-ignore
            if (fileContent !== window.fileContent) {
              // @ts-ignore
              window.fileContent = fileContent;
              console.log('content changed:');
              // @ts-ignore
              window.editMode = true;
              sendMessageToHost({
                command: 'contentChangedInEditor',
              });
            }
          }
        });
        return monacoEditor;
      });
    }

    // Cleanup on component unmount
    return () => {
      editor?.dispose();
      //modelRef.current?.dispose();
    };
  }, [monacoEl.current]);

  return (
    <>
      <div
        id="monaco_editor"
        style={{ width: '100vw', height: '100vh' }}
        ref={monacoEl}
      ></div>
      <MainMenu
        aboutLink={() => {
          sendMessageToHost({
            command: 'openLinkExternally',
            link: 'https://docs.tagspaces.org/extensions/md-editor/',
          });
        }}
        menuItems={[
          { id: 'print', name: 'Print', action: () => {} },
          { id: 'about', name: 'About', action: () => {} },
          {
            id: 'lineNumbersID',
            icon: <FormatListNumberedIcon />,
            name: 'Toggle Line Numbers',
            //dataTID: 'lineNumbersTID',
            action: () => {
              //codeMirrorRef.current?.toggleLineNumbers();
            },
          },
        ]}
      />
    </>
  );
};

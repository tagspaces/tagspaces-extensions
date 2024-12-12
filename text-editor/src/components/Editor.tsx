import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useReducer,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  ColorModeContext,
  useEventListener,
} from '@tagspaces/tagspaces-extension-ui';

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: any, label: string) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.bundle.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  },
};

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
  const getContent = () => window.fileContent;
  //const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  // @ts-ignore
  const isDarkMode = window.theme && window.theme === 'dark';
  // @ts-ignore
  const filePath = window.filePath;

  useEventListener('contentLoaded', () => {
    console.log('contentLoaded: event triggered');
    //forceUpdate();
    if (editor) {
      setReadOnly();
      // setLanguage();
      editor.setValue(getContent());
    }
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
    if (filePath.endsWith('.js')) {
      return 'javascript';
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
          setReadOnly();
          //setLanguage();
          editor.setValue(getContent());
          return editor;
        }

        // modelRef.current = monaco.editor.createModel(getContent(), getLanguage());

        return monaco.editor.create(monacoEl.current!, {
          value: getContent(),
          // model: modelRef.current,
          ...editorOption,
        });
      });
    }

    // Cleanup on component unmount
    return () => {
      editor?.dispose();
      //modelRef.current?.dispose();
    };
  }, [monacoEl.current]);

  return (
    <div
      id="monaco_editor"
      style={{ width: '100vw', height: '100vh' }}
      ref={monacoEl}
    ></div>
  );
};

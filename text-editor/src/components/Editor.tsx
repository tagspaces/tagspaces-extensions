import React, { useContext, useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  ColorModeContext,
  MainMenu,
  useEventListener,
} from '@tagspaces/tagspaces-extension-ui';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import WrapTextIcon from '@mui/icons-material/WrapText';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { sendMessageToHost } from '../utils';
import { useTranslation } from 'react-i18next';

export const Editor: React.FC = () => {
  const { t } = useTranslation();
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef<HTMLDivElement | null>(null);
  const changeListener = useRef<monaco.IDisposable | null>(null);
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

  useEventListener('keydown', (event: Event) => {
    // Type assertion to tell TypeScript that it's a KeyboardEvent
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
      if (keyboardEvent.key.toLowerCase() === 's') {
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        if (!readOnly()) {
          sendMessageToHost({ command: 'saveDocument' });
        }
      } else if (keyboardEvent.key.toLowerCase() === 'p') {
        keyboardEvent.stopPropagation();
        keyboardEvent.preventDefault();
        window.print();
      }
    }
    // if (event.key.toLowerCase() === 'escape') {
    //   setFilterVisible(false);
    // }
  });

  useEventListener('dblclick', () => {
    if (readOnly()) {
      sendMessageToHost({ command: 'editDocument' });
    }
  });

  function saveSettings(key: string, value: any) {
    const settings = {
      [key]: value,
    };
    localStorage.setItem(key, JSON.stringify(settings));
  }

  function getSettings(key: string) {
    const item = localStorage.getItem(key);
    if (item) {
      const settings = JSON.parse(item);
      return settings[key];
    }
    return undefined;
  }

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

  function cleanFilePath() {
    if (filePath.startsWith('http')) {
      return filePath.split('?')[0];
    }
    return filePath;
  }

  function getLanguage() {
    const path = cleanFilePath();
    if (path.endsWith('.js') || path.endsWith('.jsx')) {
      return 'javascript';
    } else if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return 'typescript';
    } else if (
      path.endsWith('.css') ||
      path.endsWith('.scss') ||
      path.endsWith('.less')
    ) {
      return 'css';
    } else if (path.endsWith('.py')) {
      return 'python';
    } else if (path.endsWith('.java')) {
      return 'java';
    } else if (
      path.endsWith('.h') ||
      path.endsWith('.c') ||
      path.endsWith('.cpp')
    ) {
      return 'cpp';
    } else if (
      path.endsWith('.md') ||
      path.endsWith('.mdown') ||
      path.endsWith('.mmdown') ||
      path.endsWith('.mmd') ||
      path.endsWith('.mdx')
    ) {
      return 'markdown';
    } else if (path.endsWith('.yaml')) {
      return 'yaml';
    } else if (path.endsWith('.xml')) {
      return 'xml';
    } else if (path.endsWith('.sh')) {
      return 'shell';
    } else if (
      path.endsWith('.ps1') ||
      path.endsWith('.psm1') ||
      path.endsWith('.pssc') ||
      path.endsWith('.psrc') ||
      path.endsWith('.psd1')
    ) {
      return 'powershell';
    } else if (path.endsWith('.cs')) {
      return 'csharp';
    } else if (path.endsWith('.dart')) {
      return 'dart';
    } else if (path.endsWith('.go')) {
      return 'go';
    } else if (path.endsWith('.dockerfile')) {
      return 'dockerfile';
    } else if (
      path.endsWith('.html') ||
      path.endsWith('.xhtml') ||
      path.endsWith('.handlebars') ||
      path.endsWith('.razor')
    ) {
      return 'html';
    } else if (path.endsWith('.json')) {
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
    lineNumbers: getSettings('lineNumbers'),
    fontSize: getSettings('fontSize'),
    wordWrap: getSettings('wordWrap'),
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
        changeListener.current = monacoEditor.onDidChangeModelContent(() => {
          const model = monacoEditor.getModel();
          if (model) {
            const fileContent = model.getValue();

            if (fileContent !== getContent()) {
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
      //changeListener.current?.dispose();
      //modelRef.current?.dispose();
    };
  }, [monacoEl.current]);

  const toggleLineNumbers = () => {
    if (editor) {
      const areLineNumbersVisible = editor
        .getOptions()
        .get(monaco.editor.EditorOption.lineNumbers);

      // Determine whether line numbers are visible
      const isLineNumbersOn =
        areLineNumbersVisible.renderType ===
        monaco.editor.RenderLineNumbersType.On;

      saveSettings('lineNumbers', isLineNumbersOn ? 'off' : 'on');

      editor.updateOptions({
        lineNumbers: isLineNumbersOn ? 'off' : 'on',
      });
    }
  };

  const openFindWidget = () => {
    if (editor) {
      editor.trigger('keyboard', 'actions.find', null);
    }
  };

  const toggleWordWrap = () => {
    if (editor) {
      const currentWordWrap = editor
        .getOptions()
        .get(monaco.editor.EditorOption.wordWrap);
      saveSettings('wordWrap', currentWordWrap);
      editor.updateOptions({
        wordWrap: currentWordWrap === 'off' ? 'on' : 'off',
      });
    }
  };

  const zoomIn = () => {
    if (editor) {
      const fontSize = editor
        .getOptions()
        .get(monaco.editor.EditorOption.fontSize);
      saveSettings('fontSize', fontSize);
      editor.updateOptions({
        fontSize: fontSize + 1,
      });
    }
  };

  const zoomOut = () => {
    if (editor) {
      const fontSize = editor
        .getOptions()
        .get(monaco.editor.EditorOption.fontSize);
      saveSettings('fontSize', fontSize);
      editor.updateOptions({
        fontSize: fontSize - 1,
      });
    }
  };

  const resetZoom = () => {
    if (editor) {
      saveSettings('fontSize', undefined);
      editor.updateOptions({
        fontSize: 12,
      });
    }
  };

  function printMonacoEditorContent(content: string) {
    // Step 2: Create an iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Step 3: Write content into the iframe document
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <html>
            <head>
                <title>TagSpaces Editor Content</title>
                <style>
                    body {
                        font-family: monospace;
                        white-space: pre-wrap; /* Keeps formatting like line breaks */
                        margin: 20px;
                    }
                </style>
            </head>
            <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
    `);
      iframeDoc.close();
    }

    // Step 4: Trigger the print and clean up the iframe
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
  }

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
            link: 'https://docs.tagspaces.org/extensions/text-editor/',
          });
        }}
        menuItems={[
          {
            id: 'findId',
            icon: <FindInPageIcon />,
            name: t('findInDocument'),
            action: openFindWidget,
          },
          {
            id: 'lineNumbersID',
            icon: <FormatListNumberedIcon />,
            name: t('toggleLineNumbers'),
            //dataTID: 'lineNumbersTID',
            action: toggleLineNumbers,
          },
          {
            id: 'zoomInID',
            icon: <ZoomInIcon />,
            name: t('zoomIn'),
            action: zoomIn,
          },
          {
            id: 'zoomOutID',
            icon: <ZoomOutIcon />,
            name: t('zoomOut'),
            action: zoomOut,
          },
          {
            id: 'resetZoomID',
            icon: <CenterFocusStrongIcon />,
            name: t('zoomReset'),
            action: resetZoom,
          },
          {
            id: 'wordWrapId',
            icon: <WrapTextIcon />,
            name: t('toggleWordWrap'),
            action: toggleWordWrap,
          },
          {
            id: 'print',
            name: t('print'),
            action: () => {
              printMonacoEditorContent(getContent());
            },
          },
          { id: 'about', name: t('about'), action: () => {} },
        ]}
      />
    </>
  );
};

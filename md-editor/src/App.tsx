import React, { useReducer, useState, useEffect } from 'react';
import Mark from 'mark.js';
import useEventListener from './useEventListener';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import MoreIcon from '@mui/icons-material/MoreVert';
// @ts-ignore
import EasySpeech from 'easy-speech';
import './extension.css';
import i18n from './i18n';
import MainMenu from './MainMenu';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import { CodeMirror, CodeMirrorRef } from '@tagspaces/tagspaces-codemirror';
import { sendMessageToHost } from './utils';
import SettingsDialog from './SettingsDialog';

const App: React.FC = () => {
  const [isSettingsDialogOpened, setSettingsDialogOpened] =
    useState<boolean>(false);

  const languages = React.useRef<string[] | null>(null);
  const language = React.useRef<string>(
    getSettings('speechLanguage') || i18n.language
  );
  const allVoices = React.useRef<SpeechSynthesisVoice[] | null>(null);
  const voices = React.useRef<SpeechSynthesisVoice[] | null>(null);
  const voice = React.useRef<string>(getSettings('speechVoice'));
  const rate = React.useRef<number>(getDefaultRate());
  const focusCode = React.useRef(false);
  const focus = React.useRef(false);
  const contentRef = React.useRef(null);
  const milkdownRef = React.useRef<MilkdownRef>(null);
  const codeMirrorRef = React.useRef<CodeMirrorRef>(null);
  const [mode, setMode] = React.useState('Milkdown');
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const [isFilterVisible, setFilterVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  useEffect(() => {
    EasySpeech.init()
      .then((success: boolean) => {
        if (success) {
          allVoices.current = EasySpeech.voices();
          setVoices();
        }
      })
      .catch((e: Error) => console.error(e));
  }, []);

  function setVoices(chooseFirst = false) {
    if (allVoices.current && allVoices.current.length > 0) {
      languages.current = [
        ...new Set(allVoices.current.map(v => v.lang))
      ].sort();
      const langVoices = allVoices.current.filter(
        v => v.lang === language.current
      );

      if (langVoices.length > 0) {
        voices.current = langVoices;
      } else {
        const lVoices: SpeechSynthesisVoice[] = allVoices.current.filter(v =>
          v.lang.startsWith(language.current)
        );
        if (lVoices.length > 0) {
          voices.current = lVoices;
        } else {
          voices.current = allVoices.current;
        }
      }
      if (!voice.current || chooseFirst) {
        voice.current = voices.current[0].name;
      }
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
  };

  // useEffect(() => {
  //   let content;
  //   if (contentRef && contentRef.current) {
  //     content = contentRef.current;
  //   } else {
  //     return;
  //   }
  //   const markInstance = new Mark(content);
  //   markInstance.unmark({
  //     done: () => {
  //       markInstance.mark(searchQuery);
  //     }
  //   });
  // });

  const milkdownListener = React.useCallback((markdown: string) => {
    const lock = focusCode.current;
    if (lock) return;

    //if (markdown !== prevMarkdown.current) {
    // prevMarkdown.current !== null &&
    updateContent(markdown);
    //}
    // update codeMirror
    const { current } = codeMirrorRef;
    if (!current) return;
    current.update(markdown);
  }, []);

  const onCodeChange = React.useCallback((getCode: () => string) => {
    const { current } = milkdownRef;
    if (!current) return;
    const value = getCode();
    current.update(value);
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

  const toggleViewSource = () => {
    if (mode === 'CodeMirror') {
      setMode('Milkdown');
    } else {
      setMode('CodeMirror');
    }
    console.log(JSON.stringify(milkdownRef.current));
  };

  function speak(text: string | null) {
    if (!text) return Promise.resolve(false);
    return new Promise<boolean>(resolve => {
      EasySpeech.cancel();
      EasySpeech.speak({
        text: text,
        pitch: 1.0, //0.9,
        rate: rate.current, //0.9, //1.2,
        volume: 1.0,
        lang: language.current,
        voice: getVoiceByName(voice.current),
        // there are more events, see the API for supported events
        end: () => resolve(true)
        //boundary: (e) => console.debug("boundary reached"),
      });
    });
  }

  function handleVoiceChange(voiceChosen: string) {
    if (voiceChosen) {
      voice.current = voiceChosen;
      saveSettings();
      forceUpdate();
    }
  }

  function handleLanguageChange(lang: string) {
    if (lang) {
      language.current = lang;
      setVoices(true);
      saveSettings();
      forceUpdate();
    }
  }

  function getVoiceByName(voiceName: string): SpeechSynthesisVoice | undefined {
    if (voices.current) {
      return voices.current.find(v => v.name === voiceName);
    }
    return undefined;
  }

  // const settingsKey = 'speechSettings';
  function saveSettings() {
    const speech = {
      speechRate: rate.current,
      speechLanguage: language.current,
      speechVoice: voice.current
    };
    localStorage.setItem('mdEditorSettings', JSON.stringify(speech));
  }

  function getSettings(key: string) {
    const item = localStorage.getItem('mdEditorSettings');
    if (item) {
      const settings = JSON.parse(item);
      return settings[key];
    }
    return undefined;
  }

  function getDefaultRate(): number {
    const settingsRate = getSettings('speechRate');
    if (settingsRate) {
      return parseFloat(settingsRate);
    }
    return 0.9;
  }

  /**
   * todo return: #Hellocheck_box_outline_blankoption 1One of the earliest societies was the Neolithic Karanovo cultureAPPLYAPPLYchevron_leftchevron_rightexpand_lessexpand_moreformat_align_leftformat_align_centerformat_align_rightdeleteformat_boldformat_italicstrikethrough_scodelinkdrag_indicatortitleTextlooks_oneHeading 1looks_twoHeading 2looks_3Heading 3format_list_bulletedBullet listformat_list_numberedOrdered listchecklistTask listformat_quoteBlockquotecodeCode
   */
  function getMarkdownTxt() {
    const elements = document.getElementsByClassName('milkdown');
    return elements[0]?.textContent;
  }

  const milkdownStyle =
    mode === 'Milkdown'
      ? { width: '100%', height: '100%' }
      : { width: 0, height: 0, overflow: 'hidden' };
  const codeMirrorStyle =
    mode === 'Milkdown'
      ? { width: 0, height: 0, overflow: 'hidden' }
      : { width: '100%', height: '100%' };
  return (
    <div>
      {getContent() !== undefined && (
        <div ref={contentRef}>
          <div style={milkdownStyle}>
            <MilkdownEditor
              ref={milkdownRef}
              content={getContent()}
              onChange={milkdownListener}
              onFocus={() => {
                focus.current = true;
              }}
              readOnly={readOnly()}
              dark={isDarkMode}
            />
          </div>
          <div style={codeMirrorStyle}>
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
      {/* {isFilterVisible && (
        <TextField
          style={{ position: 'absolute', right: 80, bottom: 20 }}
          label="Search in text"
          autoFocus
          size="small"
          value={searchQuery}
          onChange={handleSearch}
        />
      )} */}
      <MainMenu
        readText={() => speak(getMarkdownTxt())} //getContent())}
        cancelRead={() => EasySpeech.cancel()}
        pauseRead={() => EasySpeech.pause()}
        resumeRead={() => EasySpeech.resume()}
        toggleViewSource={toggleViewSource}
        isFilterVisible={isFilterVisible}
        setFilterVisible={setFilterVisible}
        mdContent={getContent()}
        mode={mode}
        setSettingsDialogOpened={setSettingsDialogOpened}
        haveSpeakSupport={voices.current !== null}
      />
      <SettingsDialog
        open={isSettingsDialogOpened}
        onClose={() => setSettingsDialogOpened(false)}
        handleSpeedChange={speed => {
          rate.current = speed; //parseFloat(speed);
          saveSettings();
        }}
        handleVoiceChange={handleVoiceChange}
        handleLanguageChange={handleLanguageChange}
        languages={languages.current}
        language={language.current}
        voices={voices.current}
        voice={voice.current}
        speed={rate.current}
      />
    </div>
  );
};

export default App;

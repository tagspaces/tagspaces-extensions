import './player.css';

import { useReducer, useRef, type SyntheticEvent } from 'react';

import {
  extractFileName,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import { mediaProtocol } from '@tagspaces/tagspaces-common/AppConfig';
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  type MediaCanPlayDetail,
  type MediaCanPlayEvent,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
  type MediaEndEvent,
} from '@vidstack/react';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import MainMenu from './MainMenu';
import { HideProvider, useHide } from './HideContext';
import { sendMessageToHost } from './utils';
import { Box } from '@mui/material';

export function Player() {
  const items = localStorage.getItem('viewerAudioVideoSettings');
  let defaultAutoPlay = true;
  let defaultVideoOutput = true;
  let defaultLoop = 'loopAll';
  if (items) {
    const extSettings = JSON.parse(items);
    defaultAutoPlay = extSettings.autoPlay;
    defaultVideoOutput = extSettings.enableVideoOutput;
    defaultLoop = extSettings.loop;
  }
  //const isControlsHidden = useRef<boolean>(false);
  const autoPlay = useRef<boolean>(defaultAutoPlay);
  const enableVideoOutput = useRef<boolean>(defaultVideoOutput || true);
  const loop = useRef<string>(defaultLoop); // loopOne, noLoop, loopAll
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  const searchParam = new URLSearchParams(window.location.search);

  let encrypted = false;
  if (searchParam && searchParam.has('encrypted')) {
    encrypted = searchParam.get('encrypted') === 'true';
  }
  const filePath = getFilePath();

  function getFilePath(): string {
    if (searchParam && searchParam.has('file')) {
      const file = searchParam.get('file');
      if (file) {
        if (!/^https?:\/\//.test(file)) {
          //local path
          return (
            mediaProtocol +
            '://' +
            encodeURIComponent(file)
              .replace(/%2F/g, '/')
              .replace(/%5C/g, '\\')
              .replace(/%3A/g, ':')
          );
        }
        return file;
      }
    }
    return '';
  }

  function isAudioType(): boolean {
    if (enableVideoOutput.current && filePath) {
      return /\.(mp3|wav)$/i.test(filePath);
    }
    return true;
  }
  function saveExtSettings() {
    const extSettings = {
      autoPlay: autoPlay.current,
      enableVideoOutput: enableVideoOutput.current,
      loop: loop.current,
    };
    localStorage.setItem(
      'viewerAudioVideoSettings',
      JSON.stringify(extSettings)
    );
    forceUpdate();
  }

  function setAutoPlay(value: boolean) {
    autoPlay.current = value;
    saveExtSettings();
  }
  function setVideoOutput(value: boolean) {
    enableVideoOutput.current = value;
    saveExtSettings();
  }
  function setLoop(value: string) {
    loop.current = value;
    saveExtSettings();
  }

  function onEnded(nativeEvent: MediaEndEvent) {
    if (loop.current === 'loopAll') {
      sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
    }
  }

  return (
    <HideProvider>
      {encrypted && (
        <Box
          style={{
            textAlign: 'center',
            padding: 10,
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          Document encrypted and can not be streamed. Please use the download
          functionality to get its content.
        </Box>
      )}
      {!encrypted && filePath && (
        <MediaPlayer
          viewType={isAudioType() ? 'audio' : 'video'}
          autoPlay={autoPlay.current}
          loop={loop.current === 'loopOne'}
          className="player"
          title={extractFileName(filePath)}
          src={filePath}
          crossOrigin
          playsInline
          onEnded={onEnded}
          ref={playerRef}
        >
          <MediaProvider>
            <Poster
              className="vds-poster"
              src={
               getThumbFileLocationForFile(filePath)
              }
              onError={(i: SyntheticEvent<EventTarget>) => {
                const target = i.target as HTMLImageElement;
                target.style.display = 'none'
              }}
              alt={filePath}
            />
          </MediaProvider>

          {/* Layouts */}
          <DefaultAudioLayout icons={defaultLayoutIcons} />
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            // thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          />
        </MediaPlayer>
      )}
      <MainMenu
        // isHidden={isHiddenMainMenu.current}
        isAudioType={isAudioType()}
        autoPlay={autoPlay.current}
        setAutoPlay={setAutoPlay}
        loop={loop.current}
        setLoop={setLoop}
        enableVideoOutput={enableVideoOutput.current}
        setVideoOutput={setVideoOutput}
      />
    </HideProvider>
  );
}

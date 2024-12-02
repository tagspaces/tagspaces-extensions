import './player.css';

import { useEffect, useRef, useState } from 'react';

import {
  extractFileName,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import {mediaProtocol} from '@tagspaces/tagspaces-common/AppConfig';
import {
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaCanPlayDetail,
  type MediaCanPlayEvent,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaProviderChangeEvent,
} from '@vidstack/react';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import MainMenu from './MainMenu';
import { HideProvider } from './HideContext';

// import { MediaType } from '@vidstack/react';

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

  let player = useRef<MediaPlayerInstance>(null);
  // [src, setSrc] = useState('');
  const searchParam = new URLSearchParams(window.location.search);

  let encrypted = false;
  if (searchParam && searchParam.has('encrypted')) {
    encrypted = searchParam.get('encrypted') === 'true';
  }
  const filePath = getFilePath();

  /*const audio: MediaType = 'audio';
  const video: MediaType = 'video';*/

  function getFilePath(): string {
    if (searchParam && searchParam.has('file')) {
      const file = searchParam.get('file');
      if (file) {
        if (!/^https?:\/\//.test(file)) {
          //local path
          return mediaProtocol + '://' +
            encodeURIComponent(file)
              .replace(/%2F/g, '/')
              .replace(/%5C/g, '\\')
              .replace(/%3A/g, ':');
        }
        return file;
        //fileName = extractFileName(filePath);
        //fileThumb = getThumbFileLocationForFile(filePath);
      }
    }
    return '';
  }

  function isAudioType(): boolean {
         if(enableVideoOutput.current && filePath){
              return /\.(mp3|wav)$/i.test(filePath);
         }
         return true;
  }
  function saveExtSettings() {
    const extSettings = {
      autoPlay: autoPlay.current,
      enableVideoOutput: enableVideoOutput.current,
      loop: loop.current
    };
    localStorage.setItem(
      'viewerAudioVideoSettings',
      JSON.stringify(extSettings)
    );
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

  /*useEffect(() => {
    // Initialize src.
    changeSource('audio');

    // Subscribe to state updates.
    return player.current!.subscribe(({ paused, viewType }) => {
      // console.log('is paused?', '->', paused);
      // console.log('is audio view?', '->', viewType === 'audio');
    });
  }, []);*/

  function onProviderChange(
    provider: MediaProviderAdapter | null,
    nativeEvent: MediaProviderChangeEvent
  ) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  function onCanPlay(
    detail: MediaCanPlayDetail,
    nativeEvent: MediaCanPlayEvent
  ) {
    // ...
  }

  return (
    <HideProvider>
      {encrypted && (
        <div
          style={{
            textAlign: 'center',
            padding: 10,
            color: 'white',
            fontFamily: 'sans-serif'
          }}
        >
          Document encrypted and can not be streamed. Please use the download
          functionality to get its content.
        </div>
      )}
      {!encrypted && filePath && (
        <MediaPlayer
          className="player"
          title="TagSpaces"
          src={filePath}
          crossOrigin
          playsInline
          onProviderChange={onProviderChange}
          onCanPlay={onCanPlay}
          ref={player}
        >
          <MediaProvider>
            {/*<Poster
            className="vds-poster"
            src={fileThumb}
            alt={fileName}
          />*/}
          </MediaProvider>

          {/* Layouts */}
          <DefaultAudioLayout icons={defaultLayoutIcons} />
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
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

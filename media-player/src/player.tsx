import './player.css';

import { useReducer, useRef, type SyntheticEvent } from 'react';

import {
  extractFileName,
  getThumbFileLocationForFile,
  extractContainingDirectoryPath,
  getMetaDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import {
  mediaProtocol,
  isWeb,
  dirSeparator,
} from '@tagspaces/tagspaces-common/AppConfig';
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  useMediaState,
  type MediaPlayerInstance,
  type MediaEndEvent,
} from '@vidstack/react';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import MainMenu from './MainMenu';
import { sendMessageToHost } from './utils';
import { Box } from '@mui/material';
import useEventListener from './useEventListener';

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
  const enableVideoOutput = useRef<boolean>(defaultVideoOutput);
  const loop = useRef<string>(defaultLoop); // loopOne, noLoop, loopAll
  const playerRef = useRef<MediaPlayerInstance>(null);
  const paused = useMediaState('paused', playerRef);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const searchParam = new URLSearchParams(window.location.search);

  let encrypted = false;
  if (searchParam && searchParam.has('encrypted')) {
    encrypted = searchParam.get('encrypted') === 'true';
  }
  const filePath = getFilePath();
  const fileName = decodeURIComponent(extractFileName(filePath));

  useEventListener('togglePlayPause', (triggerEvent: Event) => {
    if (playerRef.current) {
      if (paused) {
        playerRef.current.play(triggerEvent);
      } else {
        playerRef.current.pause(triggerEvent);
      }
    }
  });

  useEventListener('enterfullscreen', () => {
    if (playerRef.current) {
      playerRef.current.enterFullscreen();
    }
  });

  useEventListener('exitfullscreen', () => {
    if (playerRef.current) {
      playerRef.current.exitFullscreen();
    }
  });

  function getFilePath(): string {
    if (searchParam && searchParam.has('file')) {
      const file = searchParam.get('file');
      if (file) {
        if (!/^https?:\/\//.test(file)) {
          //local path
          return (
            mediaProtocol +
            '://' +
            (file.startsWith('/') ? '' : '/') +
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
      return /\.(mp3|wav|wave|ogg|flac|acc|m4a)$/i.test(filePath);
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
  const videoSlots = isWeb ? {} : { googleCastButton: null };
  const viewType = isAudioType() ? 'audio' : 'video';

  const textTracks = [
    // Subtitles
    /*{
      src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
      label: 'Spanish',
      language: 'es-ES',
      kind: 'subtitles',
    },*/
    // Chapters
    {
      src:
        getMetaDirectoryPath(extractContainingDirectoryPath(filePath)) +
        dirSeparator +
        fileName +
        '.chapters.vtt',
      kind: 'chapters',
      language: 'en-US',
      default: true,
    },
  ] as const;

  return (
    <>
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
          viewType={viewType}
          autoPlay={autoPlay.current}
          loop={loop.current === 'loopOne'}
          hideControlsOnMouseLeave={isAudioType() ? false : true}
          className="player"
          title={fileName}
          src={filePath}
          crossOrigin
          playsInline
          onEnded={onEnded}
          ref={playerRef}
        >
          <MediaProvider>
            {viewType === 'video' && (
              <Poster
                className="vds-poster"
                src={getThumbFileLocationForFile(filePath)}
                onError={(i: SyntheticEvent<EventTarget>) => {
                  const target = i.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                alt={filePath}
              />
            )}
            {textTracks.map((track) => (
              <Track {...track} key={track.src} />
            ))}
          </MediaProvider>

          {/* Layouts */}
          <DefaultAudioLayout icons={defaultLayoutIcons} colorScheme="dark" />
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            slots={videoSlots}
            colorScheme="system"
            // thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          />
        </MediaPlayer>
      )}
      <MainMenu
        autoPlay={autoPlay.current}
        setAutoPlay={setAutoPlay}
        loop={loop.current}
        setLoop={setLoop}
        enableVideoOutput={enableVideoOutput.current}
        setVideoOutput={setVideoOutput}
      />
    </>
  );
}

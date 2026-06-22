import './player.css';

import { useReducer, useRef, useState, type SyntheticEvent } from 'react';

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
import { useVidstackScreenshot } from './vidstackScreenshot';

export function Player() {
  const items = localStorage.getItem('viewerAudioVideoSettings');
  let defaultAutoPlay = true;
  let defaultVideoOutput = true;
  let defaultLoop = 'loopAll';
  let defaultVolume = 1;
  if (items) {
    const extSettings = JSON.parse(items);
    defaultAutoPlay = extSettings.autoPlay;
    defaultVideoOutput = extSettings.enableVideoOutput;
    defaultLoop = extSettings.loop;
    if (extSettings.volume !== undefined) {
      defaultVolume = extSettings.volume;
    }
  }
  //const isControlsHidden = useRef<boolean>(false);
  const autoPlay = useRef<boolean>(defaultAutoPlay);
  const enableVideoOutput = useRef<boolean>(defaultVideoOutput);
  const loop = useRef<string>(defaultLoop); // loopOne, noLoop, loopAll
  const volume = useRef<number>(defaultVolume);
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  // hook returns capture() and loading state
  const { capture, loading } = useVidstackScreenshot(playerRef);
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
        // Pass through any absolute URL the main app has already resolved
        // (https://, capacitor://, tsfile://, file:// …). Only raw paths
        // get the mediaProtocol prefix — needed for Electron's tsfile://
        // custom-protocol handler. On Capacitor iOS/Android the main app
        // sends capacitor:// / https:// URLs and we must not re-prefix.
        if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(file)) {
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

  // Set to true once we detect (after metadata loads) that the file has no
  // video track, regardless of its container/extension.
  const [audioOnlyDetected, setAudioOnlyDetected] = useState(false);

  function isAudioType(): boolean {
    if (enableVideoOutput.current && filePath) {
      // Match against the path only — the resolved filePath can be an absolute
      // URL carrying a query string (signed/cloud URLs) or a #fragment, which
      // would otherwise push the extension off the end and defeat the $ anchor.
      const pathOnly = filePath.split(/[?#]/)[0];
      return /\.(mp3|wav|wave|ogg|flac|aac|acc|m4a|opus)$/i.test(pathOnly);
    }
    return true;
  }

  // Extensions that denote a video container by convention. We never downgrade
  // these to audio even if the runtime momentarily (or permanently) reports no
  // video dimensions — e.g. Theora/.ogv reports its size a tick after
  // loadedmetadata, and some runtimes (Chromium) can't decode Theora at all.
  function isKnownVideoExt(): boolean {
    const pathOnly = filePath.split(/[?#]/)[0];
    return /\.(mp4|m4v|mov|avi|wmv|flv|mpg|mpeg|ogv|3gp|3g2|mkv|ts|mts|m2ts|vob)$/i.test(
      pathOnly,
    );
  }

  // Ambiguous containers (.webm and unknown extensions) can hold an audio-only
  // stream, which the filename can't reveal. Once metadata is loaded, an
  // audio-only stream reports 0x0 intrinsic video dimensions — use that to
  // switch to audio mode. Guarded so declared video formats are never affected.
  function onLoadedMetadata() {
    if (isKnownVideoExt()) {
      return;
    }
    const videoEl = playerRef.current?.el?.querySelector('video') as
      | HTMLVideoElement
      | null
      | undefined;
    if (videoEl && videoEl.videoWidth === 0 && videoEl.videoHeight === 0) {
      setAudioOnlyDetected(true);
    }
  }
  function saveExtSettings() {
    const extSettings = {
      autoPlay: autoPlay.current,
      enableVideoOutput: enableVideoOutput.current,
      loop: loop.current,
      volume: volume.current,
    };
    localStorage.setItem(
      'viewerAudioVideoSettings',
      JSON.stringify(extSettings),
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
  function setThumbnail() {
    try {
      capture({ format: 'image/jpeg' }).then((base64) => {
        if (base64) {
          sendMessageToHost({
            command: 'thumbnailGenerated',
            content: base64,
          });
        }
      });
    } catch (err) {
      console.error('capture error', err);
      alert(String(err));
    }
  }
  function setLoop(value: string) {
    loop.current = value;
    saveExtSettings();
  }

  function onVolumeChange(detail: { volume: number; muted: boolean }) {
    volume.current = detail.volume;
    saveExtSettings();
  }

  function onEnded(nativeEvent: MediaEndEvent) {
    if (loop.current === 'loopAll') {
      sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
    }
  }
  const videoSlots = isWeb ? {} : { googleCastButton: null };
  const isAudio = isAudioType() || audioOnlyDetected;
  const viewType = isAudio ? 'audio' : 'video';

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
          hideControlsOnMouseLeave={!isAudio}
          className="player"
          title={fileName}
          src={filePath}
          crossOrigin
          playsInline
          volume={volume.current}
          onVolumeChange={onVolumeChange}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          ref={playerRef}
        >
          <MediaProvider>
            {/* todo: make the loading of the poster configurable */}
            {/* {viewType === 'video' && (
              <Poster
                className="vds-poster"
                src={getThumbFileLocationForFile(filePath)}
                onError={(i: SyntheticEvent<EventTarget>) => {
                  const target = i.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                alt={filePath}
              />
            )} */}
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
        setThumbnail={setThumbnail}
        loading={loading}
      />
    </>
  );
}

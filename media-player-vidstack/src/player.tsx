import './player.css';

import { useEffect, useRef, useState } from 'react';

import {
  extractFileName,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
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

// import { MediaType } from '@vidstack/react';

export function Player() {
  let player = useRef<MediaPlayerInstance>(null);
  // [src, setSrc] = useState('');
  const searchParam = new URLSearchParams(window.location.search);
  let filePath, fileName, fileThumb;
  if (searchParam && searchParam.has('file')) {
    filePath = searchParam.get('file') || '';
  }
  if (filePath) {
    if (!/^https?:\/\//.test(filePath)) {
      //local path
      filePath =
        'video://' +
        encodeURIComponent(filePath)
          .replace(/%2F/g, '/')
          .replace(/%5C/g, '\\')
          .replace(/%3A/g, ':');
    }
    fileName = extractFileName(filePath);
    fileThumb = getThumbFileLocationForFile(filePath);
  }
  let encrypted = false;
  if (searchParam && searchParam.has('encrypted')) {
    encrypted = searchParam.get('encrypted') === 'true';
  }

  /*const audio: MediaType = 'audio';
  const video: MediaType = 'video';*/

  const isAudioType = filePath && /\.(mp3|wav)$/i.test(filePath);

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
    nativeEvent: MediaProviderChangeEvent,
  ) {
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  function onCanPlay(
    detail: MediaCanPlayDetail,
    nativeEvent: MediaCanPlayEvent,
  ) {
    // ...
  }

  /*function changeSource(type: string) {
    switch (type) {
      case 'audio':
        setSrc('https://files.vidstack.io/sprite-fight/audio.mp3');
        break;
      case 'video':
        setSrc('https://s3.eu-central-1.wasabisys.com/demots/demo/Digital-Asset-Management/Organize%20-%20Videos/Pexels%20Videos%202155942%5B5star%5D.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=B2TJ64ZNYGEPKXNMWIBG%2F20241128%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20241128T134811Z&X-Amz-Expires=900&X-Amz-Signature=00cfbce1e547dd4068c1a24a202c94478207aef680d79260ffdc9fd47793d19c&X-Amz-SignedHeaders=host&x-id=GetObject'); //'https://files.vidstack.io/sprite-fight/720p.mp4');
        break;
      case 'hls':
        setSrc('https://files.vidstack.io/sprite-fight/hls/stream.m3u8');
        break;
      case 'youtube':
        setSrc('youtube/_cMxraX_5RE');
        break;
      case 'vimeo':
        setSrc('vimeo/640499893');
        break;
    }
  }*/

  return (
    <>
      {filePath && (
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
    </>
  );
}

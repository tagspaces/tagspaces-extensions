import React from 'react';
import './extension.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import MainMenu from './MainMenu';
import {
  getThumbFileLocationForFile,
  extractFileName
} from '@tagspaces/tagspaces-common/paths';
import { HideProvider } from './HideContext';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';




const App: React.FC = () => {
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
  const isControlsHidden = React.useRef(false);
  const autoPlay = React.useRef(defaultAutoPlay);
  const enableVideoOutput = React.useRef(defaultVideoOutput);
  const loop = React.useRef<string>(defaultLoop);

  const searchParam = new URLSearchParams(window.location.search);
  const filePath = searchParam.get('file') || '';
  const encrypted = searchParam.get('encrypted') === 'true';
  const fileName = extractFileName(filePath);
  const fileThumb = getThumbFileLocationForFile(filePath);
  const isAudioType = /\.(mp3|wav)$/i.test(filePath);

  const [mediaSource, setMediaSource] = React.useState({
    src: filePath,
    type: isAudioType ? 'audio' : enableVideoOutput.current ? 'video' : 'audio',
    title: fileName,
    poster: fileThumb
      });

  function saveExtSettings() {
    const extSettings = {
      autoPlay: autoPlay.current,
      enableVideoOutput: enableVideoOutput.current,
      loop: loop.current
    };
    localStorage.setItem('viewerAudioVideoSettings', JSON.stringify(extSettings));
      }

  function setAutoPlay(value: boolean) {
    autoPlay.current = value;
    saveExtSettings();
  }
  function setVideoOutput(value: boolean) {
    enableVideoOutput.current = value;
    setMediaSource({ ...mediaSource, type: value ? 'video' : 'audio' });
    saveExtSettings();
  }
  function setLoop(value: string) {
    loop.current = value;
    saveExtSettings();
  }

  const handleEnded = () => {
    /*const loopMode = getLoopMode();
    if (loopMode === 'loopOne') {
      player.play();
    } else if (loopMode === 'noLoop') {
      // player.stop(); // No-op, as Vidstack does not stop media this way
    } else {
      sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
    }*/
  };

  return (
    <HideProvider>
      <div id="container">
        {encrypted ? (
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
        ) : (
          <MediaPlayer
            src={mediaSource.src}
            onEnded={handleEnded}
            autoplay={autoPlay.current}
            title={fileName}
            loop={loop.current === 'loopAll'}
          >
            <MediaProvider />
            {/*<DefaultVideoLayout icons={defaultLayoutIcons} />*/} {/*thumbnails={getThumbFileLocationForFile(filePath)}*/}
          </MediaPlayer>
        )}
        <MainMenu
          isAudioType={isAudioType}
          autoPlay={autoPlay.current}
          setAutoPlay={setAutoPlay}
          loop={loop.current}
          setLoop={setLoop}
          enableVideoOutput={enableVideoOutput.current}
          setVideoOutput={setVideoOutput}
        />
      </div>
    </HideProvider>
  );
};

export default App;

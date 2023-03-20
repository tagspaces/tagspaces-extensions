import React from 'react';
//import http from 'http';
//import { parse, URL } from 'url';
import './extension.css';
import {
  APITypes,
  PlyrInstance,
  PlyrProps,
  PlyrSource,
  usePlyr
} from 'plyr-react';
import 'plyr-react/plyr.css';
import MainMenu from './MainMenu';
import { MediaType } from 'plyr';
import { getThumbFileLocationForFile } from '@tagspaces/tagspaces-common/paths';
import { HideProvider, useHide } from './HideContext';
import useEventListener from './useEventListener';
import { sendMessageToHost } from './utils';

interface Props extends PlyrProps {
  filePath: string;
  getLoopMode: () => string;
}

const CustomPlyrInstance = React.forwardRef<APITypes, Props>((props, ref) => {
  const { source, options = null, getLoopMode, filePath } = props;
  const raptorRef = usePlyr(ref, { options, source });
  const { dispatch } = useHide();

  // Do all api access here, it is guaranteed to be called with the latest plyr instance
  React.useEffect(() => {
    /**
     * Fool react for using forward ref as normal ref
     * NOTE: in a case you don't need the forward mechanism and handle everything via props
     * you can create the ref inside the component by yourself
     */
    const { current } = ref as React.MutableRefObject<APITypes>;
    if (current.plyr.source === null) return;

    const api = current as { plyr: PlyrInstance };
    api.plyr.on('ready', () => {
      console.log('Plyr is ready');
      // api.plyr.play();
    });
    api.plyr.on('canplay', () => {
      // NOTE: browser may pause you from doing so:  https://goo.gl/xX8pDD
      //api.plyr.play();
      console.log('duration of audio is', api.plyr.duration);
    });
    api.plyr.on('ended', () => {
      if (getLoopMode() === 'loopOne') {
        api.plyr.play();
      } else if (getLoopMode() === 'noLoop') {
        // player.stop();
      } else {
        sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
      }
    });
    api.plyr.on('controlshidden', () => {
      dispatch({ type: 'hide' });
    });
    api.plyr.on('controlsshown', () => {
      dispatch({ type: 'show' });
    });
    /*api.plyr.on('enterfullscreen', () => {
      api.plyr.toggleControls(true);
    });
    api.plyr.on('exitfullscreen', () => {
      api.plyr.toggleControls(true);
    });*/
  });

  React.useEffect(() => {
    const { current } = ref as React.MutableRefObject<APITypes>;
    if (source !== null) {
      current.plyr.source = source;
    }
  }, [source]);

  return (
    <video
      id="player"
      ref={raptorRef as React.MutableRefObject<HTMLVideoElement>}
      className="plyr-react plyr"
    />
  );
});

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
  const isControlsHidden = React.useRef<boolean>(false);
  const autoPlay = React.useRef<boolean>(defaultAutoPlay);
  const enableVideoOutput = React.useRef<boolean>(defaultVideoOutput);
  const loop = React.useRef<string>(defaultLoop); // loopOne, noLoop, loopAll
  const ref = React.useRef<APITypes>(null);

  const searchParam = new URLSearchParams(window.location.search);
  let filePath = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
  if (searchParam && searchParam.has('file')) {
    filePath = searchParam.get('file') || '';
  }
  const fileName = filePath.split('/').pop();
  const fileThumb = getThumbFileLocationForFile(filePath);

  const audio: MediaType = 'audio';
  const video: MediaType = 'video';

  const isAudioType = /\.(mp3|wav)$/i.test(filePath);

  useEventListener('enterfullscreen', () => {
    const { current } = ref as React.MutableRefObject<APITypes>;
    const api = current as { plyr: PlyrInstance };
    isControlsHidden.current = true;
    api.plyr.toggleControls(false);
  });

  useEventListener('exitfullscreen', () => {
    const { current } = ref as React.MutableRefObject<APITypes>;
    const api = current as { plyr: PlyrInstance };
    isControlsHidden.current = false;
    api.plyr.toggleControls(true);
  });

  useEventListener('togglePlayPause', () => {
    const { current } = ref as React.MutableRefObject<APITypes>;
    const api = current as { plyr: PlyrInstance };
    isControlsHidden.current = false;
    api.plyr.playing ? api.plyr.pause() : api.plyr.play();
  });

  /*function urlExists(url) {
    return new Promise(resolve => {
      const urlParsed = parse(url);
      const options = {
        method: 'HEAD',
        host: urlParsed.host,
        path: urlParsed.pathname,
        port: urlParsed.port
      };

      const req = http.request(options, res => {
        if (res.statusCode !== undefined) {
          resolve(res.statusCode < 400 || res.statusCode >= 500);
        } else {
          resolve(false);
        }
      });

      req.end();
    });
  }*/

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

  const [videoSource, setVideoSource] = React.useState<PlyrSource>({
    type: isAudioType ? audio : enableVideoOutput.current ? video : audio,
    title: 'TagSpaces',
    sources: [
      {
        src: /^https?:\/\//.test(filePath)
          ? filePath
          : encodeURIComponent(filePath).replace(/%2F/g, '/')
      }
    ],
    poster: fileThumb, //'/path/to/poster.jpg',
    previewThumbnails: {
      src: fileThumb //'/path/to/thumbnails.vtt',
    }
    /*
  tracks: [
    {
      kind: 'captions',
      label: 'English',
      srclang: 'en',
      src: '/path/to/captions.en.vtt',
      default: true,
    },
    {
      kind: 'captions',
      label: 'French',
      srclang: 'fr',
      src: '/path/to/captions.fr.vtt',
    },
  ],*/
  });

  function setAutoPlay(value: boolean) {
    autoPlay.current = value;
    saveExtSettings();
  }
  function setVideoOutput(value: boolean) {
    enableVideoOutput.current = value;
    setVideoSource({ ...videoSource, type: value ? video : audio });
    saveExtSettings();
  }
  function setLoop(value: string) {
    loop.current = value;
    saveExtSettings();
  }

  // const hideControls = fscreen.fullscreenEnabled && fscreen.fullscreenElement !== null; //typeof window !== undefined && window.innerHeight === window.screen.height
  const videoOptions = {
    controls: [
      'play-large', // The large play button in the center
      'restart', // Restart playback
      'rewind', // Rewind by the seek time (default 10 seconds)
      'play', // Play/pause playback
      'fast-forward', // Fast forward by the seek time (default 10 seconds)
      'progress', // The progress bar and scrubber for playback and buffering
      'current-time', // The current time of playback
      // 'duration', // The full duration of the media
      'mute', // Toggle mute
      'volume', // Volume control
      // 'captions', // Toggle captions
      // 'settings', // Settings menu
      'pip' // Picture-in-picture (currently Safari only)
      // 'airplay', // Airplay (currently Safari only)
      // 'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
      // 'fullscreen', // Toggle fullscreen
    ],
    // title: 'TagSpaces',
    // tooltips: {
    //  controls: true
    // },
    displayDuration: true,
    autoplay: autoPlay.current,
    mediaMetadata: {
      title: fileName,
      artwork: [fileThumb]
    },
    /*captions: {
    defaultActive: true
  },*/
    hideControls: isControlsHidden.current, // false,
    keyboard: { focused: true, global: true },
    fullscreen: { enabled: false }
  };

  return (
    <HideProvider>
      <div id="container">
        {filePath && (
          <CustomPlyrInstance
            ref={ref}
            source={videoSource}
            options={videoOptions}
            getLoopMode={() => loop.current}
            filePath={filePath}
            // setHiddenMainMenu={setHiddenMainMenu}
          />
        )}
        <MainMenu
          // isHidden={isHiddenMainMenu.current}
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

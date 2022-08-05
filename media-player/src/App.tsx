import React from 'react';
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
// import { getThumbFileLocationForFile } from '@tagspaces/tagspaces-common/paths';

interface Props extends PlyrProps {
  filePath: string;
  getLoopMode: () => string;
  // setHiddenMainMenu: (value: boolean) => void;
}

const CustomPlyrInstance = React.forwardRef<APITypes, Props>((props, ref) => {
  const {
    source,
    options = null,
    getLoopMode,
    filePath
    // setHiddenMainMenu
  } = props;
  const raptorRef = usePlyr(ref, { options, source });

  function sendMessageToHost(message: any) {
    window.parent.postMessage(JSON.stringify(message), '*');
  }

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
      console.log("I'm ready");
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
    /*api.plyr.on('controlshidden', () => {
      setHiddenMainMenu(true);
    });
    api.plyr.on('controlsshown', () => {
      setHiddenMainMenu(false);
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
  // const isHiddenMainMenu = React.useRef<boolean>(false);
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
  // const fileThumb = getThumbFileLocationForFile(filePath); TODO rethink this

  const audio: MediaType = 'audio';
  const video: MediaType = 'video';

  const isAudioType = /\.(mp3|wav)$/i.test(filePath);

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
        src: filePath
      }
    ],
    /*poster: fileThumb, //'/path/to/poster.jpg',
    previewThumbnails: {
      src: fileThumb //'/path/to/thumbnails.vtt',
    }*/
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

  /*function setHiddenMainMenu(value: boolean) {
    isHiddenMainMenu.current = value;
  }*/
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
      title: fileName
    },
    /*captions: {
    defaultActive: true
  },*/
    hideControls: false,
    keyboard: { focused: true, global: true },
    fullscreen: { enabled: false }
  };

  return (
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
  );
};

export default App;

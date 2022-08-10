import { APITypes, PlyrInstance, PlyrProps, usePlyr } from 'plyr-react';
import React from 'react';
import { useHide } from './HideContext';

interface Props extends PlyrProps {
  filePath: string;
  getLoopMode: () => string;
}

const CustomPlyrInstance = React.forwardRef<APITypes, Props>((props, ref) => {
  const { source, options = null, getLoopMode, filePath } = props;
  const raptorRef = usePlyr(ref, { options, source });
  const { dispatch } = useHide();

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

  /*React.useEffect(() => {
    const { current } = ref as React.MutableRefObject<APITypes>;
    if (source !== null) {
      current.plyr.source = source;
    }
  }, [source]);*/

  return (
    <video
      id="player"
      ref={raptorRef as React.MutableRefObject<HTMLVideoElement>}
      className="plyr-react plyr"
    />
  );
});

export default CustomPlyrInstance;

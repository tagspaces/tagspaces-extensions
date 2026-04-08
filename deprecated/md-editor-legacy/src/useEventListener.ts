import { useRef, useEffect, RefObject } from 'react';

// Hook
export default function useEventListener<T>(
  eventName: string,
  handler: Function,
  element?: RefObject<T>
) {
  // Create a ref that stores handler
  const savedHandler = useRef<Function>();
  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current || window;
    // @ts-ignore
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }
    // Update saved handler if necessary
    if (savedHandler.current !== handler) {
      savedHandler.current = handler;
    }
    // Create event listener that calls handler function stored in ref
    const eventListener = (event: Event) => {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!savedHandler?.current) {
        savedHandler.current(event);
      }
    };
    // @ts-ignore
    targetElement.addEventListener(eventName, eventListener);
    // Remove event listener on cleanup
    return () => {
      // @ts-ignore
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element, handler]);
}

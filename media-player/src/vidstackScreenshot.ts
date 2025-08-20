import React, { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import { type MediaPlayerInstance } from '@vidstack/react';

/* ---------------------------
   Utility: find <video> inside shadow roots / DOM
   Accepts a root which may be a MediaPlayerInstance (web component) or any ParentNode.
   --------------------------- */
function findVideoElement(root: ParentNode | null): HTMLVideoElement | null {
  if (!root) return null;

  // try a quick querySelector if possible
  try {
    const el =
      (root as Document | Element).querySelector &&
      (root as Document | Element).querySelector('video');
    if (el) return el as HTMLVideoElement;
  } catch (e) {
    // ignore
  }

  // walk element children to look for shadow roots
  const children = (root as Element)?.querySelectorAll
    ? Array.from((root as Element).querySelectorAll('*'))
    : [];
  for (const el of children) {
    // some web components expose .shadowRoot
    const maybeShadow = (el as Element & { shadowRoot?: ShadowRoot })
      .shadowRoot;
    if (maybeShadow) {
      const found = findVideoElement(maybeShadow);
      if (found) return found;
    }
  }

  return null;
}

/* ---------------------------
   Hook: useVidstackScreenshot (ref typed as MediaPlayerInstance)
   --------------------------- */
export function useVidstackScreenshot(
  playerRef: RefObject<MediaPlayerInstance | null>,
) {
  const [loading, setLoading] = useState(false);

  const capture = useCallback(
    async (opts?: {
      format?: 'image/png' | 'image/jpeg';
      quality?: number;
    }) => {
      setLoading(true);
      try {
        const {
          format = 'image/png',
          quality = 0.92,
        } = opts || {};

        // playerRef.current is a MediaPlayerInstance (web component). Treat it as ParentNode to search inside
        const playerRoot = playerRef?.current as unknown as ParentNode | null;
        if (!playerRoot) throw new Error('player ref not attached');

        // find the actual <video> element
        let video = findVideoElement(playerRoot) || findVideoElement(document);
        if (!video)
          throw new Error(
            'No <video> element found inside the player or document',
          );

        // best-effort: set crossOrigin (must be set before source loads to be fully effective)
        try {
          if (!video.crossOrigin) video.crossOrigin = 'anonymous';
        } catch (e) {
          // ignore if browser prevents changing it after load
        }

        // wait for at least one frame
        if (video.readyState < 2) {
          await new Promise<void>((resolve, reject) => {
            const onLoaded = () => {
              cleanup();
              resolve();
            };
            const onErr = () => {
              cleanup();
              reject(new Error('Video failed to load'));
            };
            function cleanup() {
              if (video) {
                video.removeEventListener('loadeddata', onLoaded);
                video.removeEventListener('error', onErr);
              }
            }
            if (video) {
              video.addEventListener('loadeddata', onLoaded);
              video.addEventListener('error', onErr);
            }
          });
        }

        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) throw new Error('Video width/height not available');

        const ratio = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(w * ratio);
        canvas.height = Math.floor(h * ratio);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D context not available');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.drawImage(video, 0, 0, w, h);

        return canvas.toDataURL(format, quality);
      } finally {
        setLoading(false);
      }
    },
    [playerRef],
  );

  return { capture, loading } as const;
}

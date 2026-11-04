import React, { useEffect, useRef, useState } from 'react';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

// File names are relative to public/assets. A poster remains visible until
// a video file is supplied, or if the browser cannot load that video.
export default function Media({ image, video, alt = '', className, width, height, loading, autoPlay = true, loop = true, muted = true, controls = false, warmup = false, reducedMotionControls = true, ...props }) {
  if (!video && image?.startsWith('videos/') && image.endsWith('.gif')) video = image.replace(/\.gif$/, '.mp4');
  const player = useRef(null);
  const [failedVideo, setFailedVideo] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visibleForPlayback, setVisibleForPlayback] = useState(false);

  useEffect(() => {
    if (!video || failedVideo === video) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const element = player.current;
    if (!element) return;
    element.defaultMuted = muted;
    element.muted = muted;
    element.setAttribute('playsinline', '');
    element.setAttribute('webkit-playsinline', '');
    let visible = false;
    const bufferObserver = warmup && typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.preload = 'auto';
      bufferObserver.disconnect();
    }, { rootMargin: '1200px 0px' }) : null;
    bufferObserver?.observe(element);
    const update = () => {
      setReducedMotion(preference.matches);
      setVisibleForPlayback(visible && !document.hidden);
      const canPlay = autoPlay && !preference.matches && visible && !document.hidden;
      element.autoplay = canPlay;
      if (!canPlay) {
        element.pause();
      } else if (!element.ended) {
        element.preload = 'auto';
        element.play().catch(() => {});
      }
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0;
      update();
    }, { threshold: 0.01 });
    if (observer) observer.observe(element);
    else visible = true;
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    element.addEventListener('canplay', update);
    document.addEventListener('touchend', update, { passive: true });
    document.addEventListener('pointerup', update, { passive: true });
    update();
    return () => {
      observer?.disconnect();
      bufferObserver?.disconnect();
      element.pause();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
      element.removeEventListener('canplay', update);
      document.removeEventListener('touchend', update);
      document.removeEventListener('pointerup', update);
    };
  }, [video, failedVideo, autoPlay, muted, warmup]);

  if (!video || failedVideo === video) {
    return image ? <img src={asset(image)} alt={alt} className={className} width={width} height={height} loading={loading} decoding="async" /> : null;
  }

  return <video {...props} key={video} ref={player} className={className} width={width} height={height}
    src={asset(video)} poster={image && !image.endsWith('.gif') ? asset(image) : undefined}
    aria-label={alt || 'Portfolio video'} controls={controls || (reducedMotion && reducedMotionControls)} playsInline preload="metadata"
    autoPlay={autoPlay && !reducedMotion && visibleForPlayback} muted={muted} loop={loop}
    onError={() => setFailedVideo(video)} />;
}

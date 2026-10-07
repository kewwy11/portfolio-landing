import React, { useEffect, useRef, useState } from 'react';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

// File names are relative to public/assets. A poster remains visible until
// a video file is supplied, or if the browser cannot load that video.
export default function Media({ image, video, alt = '', className, width, height, loading, autoPlay = true, loop = true, muted = true, controls = false }) {
  const player = useRef(null);
  const [failedVideo, setFailedVideo] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    if (!video || failedVideo === video) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const element = player.current;
    if (!element) return;
    let visible = false;
    const update = () => {
      setReducedMotion(preference.matches);
      const canPlay = autoPlay && !preference.matches && visible && !document.hidden;
      if (!canPlay) {
        element.pause();
      } else if (!element.ended) element.play().catch(() => {});
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.01 });
    if (observer) observer.observe(element);
    else visible = true;
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer?.disconnect();
      element.pause();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [video, failedVideo, autoPlay]);

  if (!video || failedVideo === video) {
    return image ? <img src={asset(image)} alt={alt} className={className} width={width} height={height} loading={loading} decoding="async" /> : null;
  }

  return <video key={video} ref={player} className={className} width={width} height={height}
    src={asset(video)} poster={image ? asset(image) : undefined}
    aria-label={alt || 'Portfolio video'} controls={controls || reducedMotion} playsInline preload="metadata"
    muted={muted} loop={loop}
    onError={() => setFailedVideo(video)} />;
}

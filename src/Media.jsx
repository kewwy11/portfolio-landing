import React, { useEffect, useRef, useState } from 'react';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

// File names are relative to public/assets. A poster remains visible until
// a video file is supplied, or if the browser cannot load that video.
export default function Media({ image, video, alt = '', className, width, height, loading, autoPlay = true, loop = true, muted = true }) {
  const player = useRef(null);
  const [failedVideo, setFailedVideo] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    if (!video || failedVideo === video) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      setReducedMotion(preference.matches);
      if (!player.current) return;
      if (preference.matches || !visible) player.current.pause();
      else if (autoPlay) player.current.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.01 });
    observer.observe(player.current);
    preference.addEventListener('change', update);
    update();
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', update);
    };
  }, [video, failedVideo, autoPlay]);

  if (!video || failedVideo === video) {
    return image ? <img src={asset(image)} alt={alt} className={className} width={width} height={height} loading={loading} /> : null;
  }

  return <video key={video} ref={player} className={className} width={width} height={height}
    src={asset(video)} poster={image ? asset(image) : undefined}
    aria-label={alt || 'Portfolio video'} controls playsInline preload="metadata"
    autoPlay={autoPlay && muted && !reducedMotion} loop={loop} muted={muted}
    onError={() => setFailedVideo(video)} />;
}

import React, { useEffect, useRef } from 'react';

export default function BeaconBackgroundVideo(props) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    const play = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.play().catch(() => {});
    };
    video.addEventListener('canplay', play);
    play();
    return () => video.removeEventListener('canplay', play);
  }, [props.src]);
  return <video {...props} ref={ref} autoPlay loop muted playsInline />;
}

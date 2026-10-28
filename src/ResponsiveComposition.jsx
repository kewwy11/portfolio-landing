import React, { useLayoutEffect, useRef } from 'react';

// Keep a composed artwork's internal proportions together on a narrow screen.
export default function ResponsiveComposition({ width, height, children, className = '' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      ref.current.style.setProperty('--composition-scale', entry.contentRect.width / width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={ref} className={`responsive-composition ${className}`} style={{ '--composition-width':`${width}px`, '--composition-height':`${height}px`, '--composition-aspect':`${width}/${height}` }}>
    <div className="responsive-composition-stage">{children}</div>
  </div>;
}

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './eyes-cursor.css';

const root = `${import.meta.env.BASE_URL}assets/cursor/`;
const eyes = {
  up: ['imgGroup9.svg', 'imgGroup10.svg'],
  idle: ['imgGroup11.svg', 'imgGroup12.svg'],
  down: ['imgGroup13.svg', 'imgGroup14.svg'],
};

export default function EyesCursor() {
  const ref = useRef(null);
  const [direction, setDirection] = useState('idle');
  const [portalTarget, setPortalTarget] = useState(document.body);
  const lastPointer = useRef(null);
  useEffect(() => {
    // A modal is in the browser's top layer, above every body-level z-index.
    // Keep the same custom cursor inside the active dialog while it is open.
    const syncTarget = () => setPortalTarget([...document.querySelectorAll('dialog[open]')].at(-1) || document.body);
    const observer = new MutationObserver(syncTarget);
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['open'] });
    syncTarget();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const cursor = ref.current;
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    const scrollPositions = new WeakMap();
    let previousY = window.scrollY;
    let timer;
    let ready = false;
    let disposed = false;
    const hide = () => {
      cursor.classList.remove('is-visible');
      document.documentElement.classList.remove('has-eyes-cursor');
      clearTimeout(timer);
      setDirection('idle');
    };
    const move = event => {
      lastPointer.current = event;
      if (!ready || !pointer.matches || event.pointerType !== 'mouse') { hide(); return; }
      cursor.style.transform = `translate3d(${event.clientX - 28}px,${event.clientY - 19.5}px,0)`;
      cursor.classList.add('is-visible');
      document.documentElement.classList.add('has-eyes-cursor');
    };
    const scroll = event => {
      const target = event.target;
      const isPage = target === document;
      const current = isPage ? window.scrollY : target.scrollTop;
      const previous = isPage ? previousY : (scrollPositions.get(target) ?? 0);
      if (isPage) previousY = current;
      else scrollPositions.set(target, current);
      if (!pointer.matches || !cursor.classList.contains('is-visible')) return;
      if (current === previous) return;
      setDirection(current < previous ? 'up' : 'down');
      clearTimeout(timer);
      timer = setTimeout(() => setDirection('idle'), 180);
    };
    Promise.all([...cursor.querySelectorAll('img')].map(image => image.decode())).then(() => {
      if (!disposed) {
        ready = true;
        if (lastPointer.current) move(lastPointer.current);
      }
    }).catch(() => {});
    const leave = event => { if (!event.relatedTarget) hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    window.addEventListener('pointermove', move, { passive:true });
    document.addEventListener('scroll', scroll, { passive:true, capture:true });
    document.addEventListener('pointerout', leave);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    pointer.addEventListener('change', hide);
    return () => {
      disposed = true;
      hide();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('scroll', scroll, true);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
      pointer.removeEventListener('change', hide);
    };
  }, [portalTarget]);
  return createPortal(<div ref={ref} className="eyes-cursor" data-direction={direction} aria-hidden="true">
    {Object.entries(eyes).map(([state, pair]) => <div key={state} className={`eyes-cursor-pair${state === direction ? ' is-active' : ''}`}>
      {pair.map(src => <img key={src} src={`${root}${src}`} alt="" draggable="false" />)}
    </div>)}
  </div>, portalTarget);
}

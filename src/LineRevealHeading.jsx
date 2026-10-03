import React, { useLayoutEffect, useRef, useState } from 'react';
import useRevealOnScroll from './useRevealOnScroll.js';
import './line-reveal.css';

// Read the browser's actual line breaks without inserting spans into its text.
function measureLines(heading, source, text) {
  const node = source.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE || !text) return [];

  const headingRect = heading.getBoundingClientRect();
  const sourceRect = source.getBoundingClientRect();
  const range = document.createRange();
  const groups = [];
  let offset = 0;

  for (const character of text) {
    const end = offset + character.length;
    if (!/\s/.test(character)) {
      range.setStart(node, offset);
      range.setEnd(node, end);
      const rect = range.getBoundingClientRect();
      if (rect.height) {
        const previous = groups.at(-1);
        if (!previous || Math.abs(previous.top - rect.top) > 1) {
          groups.push({ start: offset, end, top: rect.top, left: rect.left });
        } else {
          previous.end = end;
        }
      }
    }
    offset = end;
  }
  if (!groups.length) return [];

  const firstTop = groups[0].top;
  const contentTop = sourceRect.top - headingRect.top;
  return groups.map((line, index) => {
    const top = contentTop + line.top - firstTop;
    const nextTop = groups[index + 1]
      ? contentTop + groups[index + 1].top - firstTop
      : sourceRect.bottom - headingRect.top;
    return {
      text: text.slice(line.start, line.end),
      top,
      height: nextTop - top,
      left: line.left - headingRect.left,
    };
  });
}

export default function LineRevealHeading({ as: Tag = 'h2', children, stagger = 140, className = '', ...props }) {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ threshold: 0.15, repeat: true, rootMargin: '0px' });
  const sourceRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [fontsReady, setFontsReady] = useState(false);
  const [settled, setSettled] = useState(false);
  const text = String(children);
  const immediate = reducedMotion || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function';

  useLayoutEffect(() => {
    if (!revealed) setSettled(false);
  }, [revealed]);

  useLayoutEffect(() => {
    const heading = ref.current;
    const source = sourceRef.current;
    if (!heading || !source) return;
    let active = true;
    let frame = 0;
    const measure = () => {
      if (!active) return;
      const nextLines = measureLines(heading, source, text);
      setLines(previous => JSON.stringify(previous) === JSON.stringify(nextLines) ? previous : nextLines);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const ready = document.fonts?.ready || Promise.resolve();
    ready.then(() => {
      if (!active) return;
      measure();
      setFontsReady(true);
    });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(source);
    window.addEventListener('resize', schedule);
    document.fonts?.addEventListener('loadingdone', schedule);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      document.fonts?.removeEventListener('loadingdone', schedule);
    };
  }, [text, ref]);

  const running = revealed && fontsReady && lines.length > 0;
  return <Tag {...props} ref={ref} className={`line-reveal-heading${running ? ' is-revealed' : ''}${revealed && settled ? ' is-settled' : ''}${immediate ? ' motion-disabled' : ''}${className ? ` ${className}` : ''}`}>
    <span ref={sourceRef} className="line-reveal-source">{text}</span>
    <span className="line-reveal-layer" aria-hidden="true">
      {lines.map((line, index) => <span key={index} className="line-reveal-mask" style={{ top: line.top, height: line.height }}>
        <span className="line-reveal-text" style={{ left: line.left, '--line-delay': `${index * stagger}ms` }} onAnimationEnd={() => {
          if (revealed && index === lines.length - 1) setSettled(true);
        }}>{line.text}</span>
      </span>)}
    </span>
  </Tag>;
}

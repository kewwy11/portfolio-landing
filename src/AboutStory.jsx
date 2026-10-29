import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './about-story.css';

gsap.registerPlugin(ScrollTrigger);
const EASE = 'cubic-bezier(.65, 0, .35, 1)';
const TRANSITION_SECONDS = .72;
const clamp = value => Math.max(0, Math.min(1, value));
// Use the same symmetric curve with or without native animation support.
function ease(progress) {
  if (progress === 0 || progress === 1) return progress;
  let low = 0, high = 1;
  for (let index = 0; index < 16; index++) {
    const t = (low + high) / 2;
    const x = 3 * (1 - t) ** 2 * t * .65 + 3 * (1 - t) * t ** 2 * .35 + t ** 3;
    if (x < progress) low = t; else high = t;
  }
  const t = (low + high) / 2;
  return 3 * (1 - t) * t ** 2 + t ** 3;
}
const story = [
  {
    image: 'about-story-design-board.png', width: 538, minHeight: 288,
    alt: 'Lumis product design screens arranged on a dark design board',
    groups: [
      ['How it made you feel, how alive you probably felt for the first time in a long time, the little giggles you let out when you remember it.',
        'But if we are being honest, you really can’t remember most details of the day but you would never forget the experience.'],
      ['That for me, is how design should work.'],
    ],
  },
  {
    image: 'about-story-lumis-collage.png', width: 523, minHeight: 180,
    alt: 'Lumis identity and skincare campaign images arranged on a design board',
    groups: [['Creating visuals, experiences, and moments that leave a lasting impression with users.',
      'I call myself a generalist because there is no single way to achieve that in design, and every touchpoint should create that feeling.']],
  },
  {
    image: 'about-story-photoshop.png', width: 523, minHeight: 360,
    alt: 'Creative workspace with campaign visuals open in Photoshop',
    groups: [
      ['From a strategy that positions the Company to its target audience and plays to its strengths, to a brand and visual identity that can be spotted in a sea of competitors.',
        "Or it could be an application or website that makes users feel like they've escaped reality for a minute."],
      ['That’s what I bring to the table. It’s not just design; for me, it’s an experience.'],
    ],
  },
];
const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;

function StoryCopy({ item, innerRef }) {
  return <div ref={innerRef} className="story-copy" style={{ '--copy-width': `${item.width}px`,
    '--copy-min-height': `${item.minHeight || 0}px` }}>
    {item.groups.map((paragraphs, index) => <div className="story-copy-group" key={index}>
      {paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    </div>)}
  </div>;
}

export default function AboutStory({ ready = true }) {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 760px)').matches);
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [layout, setLayout] = useState(() => ({ frameHeight: Math.min(668, window.innerHeight),
    range: 2 * Math.max(window.innerHeight, 500), top: 0, copyHeight: 360, imageHeight: null }));

  useEffect(() => {
    const query = matchMedia('(max-width: 760px)');
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = event => setReducedMotion(event.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let mounted = true;
    const measure = () => {
      if (!mounted) return;
      const viewportHeight = window.innerHeight;
      const mobile = window.innerWidth <= 760;
      const copyHeight = Math.ceil(Math.max(!mobile && viewportHeight >= 668 ? 360 : 0,
        ...textRefs.current.map(node => node?.getBoundingClientRect().height || 0)));
      const style = getComputedStyle(frame);
      const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const gap = parseFloat(style.rowGap);
      const imageWidth = frame.querySelector('.story-image-window').getBoundingClientRect().width;
      const imageHeight = Math.max(1, Math.min(imageWidth * (mobile ? 355 / 361 : 588 / 670),
        viewportHeight - padding - (mobile ? copyHeight + gap : 0)));
      frame.style.setProperty('--story-copy-height', `${copyHeight}px`);
      frame.style.setProperty('--story-image-height', `${imageHeight}px`);
      const frameHeight = Math.ceil(frame.getBoundingClientRect().height);
      const next = { frameHeight, copyHeight, imageHeight, range: 2 * Math.max(viewportHeight, 500),
        top: Math.max(0, Math.floor((viewportHeight - frameHeight) / 2)) };
      setLayout(current => Object.keys(next).every(key => next[key] === current[key]) ? current : next);
    };
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(frame);
    textRefs.current.forEach(node => { if (node) observer?.observe(node); });
    window.addEventListener('resize', measure);
    document.fonts.ready.then(measure);
    return () => { mounted = false; observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [ready, mobile]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const nativeAnimation = !reducedMotion && typeof Element.prototype.animate === 'function';
    const timing = { duration: 1000, fill: 'both', easing: 'linear' };
    const textAnimation = nativeAnimation ? trackRef.current.animate([
      { offset: 0, transform: 'translateY(0px)', easing: EASE },
      { offset: .5, transform: `translateY(-${layout.copyHeight}px)`, easing: EASE },
      { offset: 1, transform: `translateY(-${2 * layout.copyHeight}px)` },
    ], timing) : null;
    if (textAnimation) textAnimation.id = 'about-story-text';
    const imageAnimations = nativeAnimation ? imageRefs.current.slice(1).map((node, index) => {
      const start = index * .5;
      const end = start + .5;
      const animation = node.animate([
        ...(start > 0 ? [{ offset: 0, clipPath: 'inset(100% 0px 0px 0px)' }] : []),
        { offset: start, clipPath: 'inset(100% 0px 0px 0px)', easing: EASE },
        { offset: end, clipPath: 'inset(0px 0px 0px 0px)' },
        ...(end < 1 ? [{ offset: 1, clipPath: 'inset(0px 0px 0px 0px)' }] : []),
      ], timing);
      animation.id = `about-story-image-${index + 2}`;
      return animation;
    }) : [];
    const animations = [textAnimation, ...imageAnimations].filter(Boolean);
    animations.forEach(animation => animation.pause());
    let sceneIndex = 0;
    let moving = false;
    let gestureReady = true;
    let positioning = false;
    let tween;
    let observer;
    let trigger;
    const paint = progress => {
      animations.forEach(animation => { animation.currentTime = progress * 1000; });
      if (!nativeAnimation) {
        const incoming = [0, 1].map(index => reducedMotion
          ? Number(progress >= (index + 1) * .5)
          : ease(clamp(progress * 2 - index)));
        trackRef.current.style.transform = `translateY(-${(incoming[0] + incoming[1]) * layout.copyHeight}px)`;
        imageRefs.current.slice(1).forEach((image, index) => {
          image.style.clipPath = `inset(${100 * (1 - incoming[index])}% 0px 0px 0px)`;
        });
      }
      section.dataset.progress = progress.toFixed(4);
      section.dataset.stage = String(sceneIndex + 1);
    };
    const playhead = { progress: 0 };
    const settle = index => {
      tween?.kill();
      sceneIndex = index;
      moving = false;
      playhead.progress = index * .5;
      section.dataset.transitioning = 'false';
      paint(playhead.progress);
    };
    const position = top => {
      positioning = true;
      window.scrollTo({ top, behavior: 'instant' });
      ScrollTrigger.update();
      positioning = false;
    };
    const advance = (direction, distance = Math.abs(observer.deltaY || 40)) => {
      if (moving || !gestureReady) return;
      const next = sceneIndex + direction;
      gestureReady = false;
      if (next < 0 || next >= story.length) {
        observer.disable();
        position(next < 0 ? trigger.start - Math.max(2, distance) : trigger.end + Math.max(2, distance));
        return;
      }
      sceneIndex = next;
      moving = true;
      section.dataset.transitioning = 'true';
      // Keep the same pinned frame; one gesture advances one complete scene.
      position(trigger.start + Math.max(2, Math.min(layout.range - 2, next * layout.range / 2)));
      tween = gsap.to(playhead, { progress: next * .5, duration: reducedMotion ? 0 : TRANSITION_SECONDS,
        ease: 'none', onUpdate: () => paint(playhead.progress), onComplete: () => {
          moving = false;
          section.dataset.transitioning = 'false';
          paint(next * .5);
        } });
    };
    observer = ScrollTrigger.observe({
      target: window, type: 'wheel,touch', wheelSpeed: -1,
      tolerance: 1, dragMinimum: 8, preventDefault: true, allowClicks: true,
      ignoreCheck: event => event.ctrlKey || event.touches?.length > 1
        || Boolean(event.target.closest?.('.menu-layer, input, textarea, select, button, a, [contenteditable="true"]')),
      onUp: () => advance(1), onDown: () => advance(-1),
      // Ignore momentum during a transition; a fresh gesture can advance again.
      onStopDelay: .15,
      onStop: self => { if (!self.isPressed) gestureReady = true; },
      onPress: () => { gestureReady = true; },
      onRelease: () => { gestureReady = true; },
    });
    observer.disable();
    trigger = ScrollTrigger.create({
      trigger: section, start: `top ${layout.top}px`, end: `+=${layout.range}`,
      onEnter: () => { if (!positioning) settle(0); gestureReady = true; observer.enable(); },
      onEnterBack: () => { if (!positioning) settle(2); gestureReady = true; observer.enable(); },
      onUpdate: self => {
        // Native anchors, scrollbar dragging and focus navigation remain usable.
        if (!positioning && !moving) settle(Math.round(self.progress * 2));
      },
      onRefresh: self => {
        if (moving) return;
        settle(Math.round(self.progress * 2));
        if (self.isActive) observer.enable(); else observer.disable();
      },
      onLeave: () => { observer.disable(); if (!positioning) settle(2); },
      onLeaveBack: () => { observer.disable(); if (!positioning) settle(0); },
    });
    const keydown = event => {
      if (!observer.isEnabled || event.ctrlKey || event.metaKey || event.altKey
        || event.target.closest?.('input, textarea, select, button, a, [contenteditable="true"], .menu-layer')) return;
      const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1
        : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : event.key === ' ' ? (event.shiftKey ? -1 : 1) : 0;
      if (!direction) return;
      event.preventDefault();
      if (!event.repeat && !moving) { gestureReady = true; advance(direction, window.innerHeight * .8); }
    };
    const refresh = () => trigger.refresh();
    window.addEventListener('keydown', keydown);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('pageshow', refresh);
      observer.kill();
      trigger.kill();
      tween?.kill();
      animations.forEach(animation => animation.cancel());
      trackRef.current?.style.removeProperty('transform');
      imageRefs.current.slice(1).forEach(image => image?.style.removeProperty('clip-path'));
    };
  }, [layout, reducedMotion, mobile]);

  return <section ref={sectionRef} id="about-story" className="about-story is-pinned"
    aria-label="My approach to design" data-mode="pinned" data-stage="1" data-progress="0" data-transitioning="false"
    style={{ height: `${layout.frameHeight + layout.range}px` }}>
    <div ref={frameRef} className="story-sticky" aria-hidden="true"
      style={{ '--story-top': `${layout.top}px`, '--story-copy-height': `${layout.copyHeight}px`,
        '--story-image-height': layout.imageHeight === null ? undefined : `${layout.imageHeight}px` }}>
      <div className="story-image-window">
        {story.map((item, index) => <img ref={node => { imageRefs.current[index] = node; }} className="story-visual-image"
          key={item.image} src={asset(item.image)} alt="" width="670" height="588" />)}
      </div>
      <div className="story-text-window"><div ref={trackRef} className="story-text-track">
        {story.map((item, index) => <div className="story-text-panel" key={item.image}>
          <StoryCopy item={item} innerRef={node => { textRefs.current[index] = node; }} />
        </div>)}
      </div></div>
    </div>
    <div className="story-flow">
      {story.map(item => <article className="story-flow-stage" key={item.image}>
        <img src={asset(item.image)} alt={item.alt} width="670" height="588" />
        <StoryCopy item={item} />
      </article>)}
    </div>
  </section>;
}

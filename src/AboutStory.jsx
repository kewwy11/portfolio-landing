import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './about-story.css';

gsap.registerPlugin(ScrollTrigger);
const EASE = 'cubic-bezier(.65, 0, .35, 1)';
const SCRUB_SECONDS = .4;
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
    image: 'about-story-memory.png', width: 641,
    alt: 'Two friends sitting together outdoors in warm evening light',
    groups: [
      ['How it made you feel, how alive you probably felt for the first time in a long time, the little giggles you let out when you remember it.',
        'But if we are being honest, you really can’t remember most details of the day but you would never forget the experience.'],
      ['That for me, is how design should work.'],
    ],
  },
  {
    image: 'about-story-visuals.png', width: 646,
    alt: 'A woman holding sliced fruit in a sunlit doorway',
    groups: [['Creating visuals, experiences, and moments that leave a lasting impression with users.',
      'I call myself a generalist because there is no single way to achieve that in design, and every touchpoint should create that feeling.']],
  },
  {
    image: 'about-story-brand.png', width: 670,
    alt: 'Green Assure brand identity stationery arranged on a matching background',
    groups: [
      ['From a strategy that positions the Company to its target audience and plays to its strengths, to a brand and visual identity that can be spotted in a sea of competitors.',
        "Or it could be an application or website that makes users feel like they've escaped reality for a minute."],
      ['That’s what I bring to the table. It’s not just design; for me, it’s an experience.'],
    ],
  },
];
const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;

function StoryCopy({ item, innerRef }) {
  return <div ref={innerRef} className="story-copy" style={{ '--copy-width': `${item.width}px` }}>
    {item.groups.map((paragraphs, index) => <div className="story-copy-group" key={index}>
      {paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    </div>)}
  </div>;
}

export default function AboutStory({ ready = true }) {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [layout, setLayout] = useState(() => ({ frameHeight: Math.min(668, window.innerHeight),
    range: 2 * Math.max(window.innerHeight, 500), top: 0, copyHeight: 360, imageHeight: null }));

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
      const imageHeight = Math.max(1, Math.min(imageWidth * 588 / 670,
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
  }, [ready]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const nativeAnimation = !reducedMotion && typeof Element.prototype.animate === 'function';
    const timing = { duration: 1000, fill: 'both', easing: 'linear' };
    const textAnimation = nativeAnimation ? trackRef.current.animate([
      { offset: 0, transform: 'translateY(0px)' },
      { offset: .125, transform: 'translateY(0px)', easing: EASE },
      { offset: .375, transform: `translateY(-${layout.copyHeight}px)` },
      { offset: .625, transform: `translateY(-${layout.copyHeight}px)`, easing: EASE },
      { offset: .875, transform: `translateY(-${2 * layout.copyHeight}px)` },
      { offset: 1, transform: `translateY(-${2 * layout.copyHeight}px)` },
    ], timing) : null;
    if (textAnimation) textAnimation.id = 'about-story-text';
    const imageAnimations = nativeAnimation ? imageRefs.current.slice(1).map((node, index) => {
      const start = index === 0 ? .125 : .625;
      const end = index === 0 ? .375 : .875;
      const animation = node.animate([
        { offset: 0, clipPath: 'inset(100% 0px 0px 0px)' },
        { offset: start, clipPath: 'inset(100% 0px 0px 0px)', easing: EASE },
        { offset: end, clipPath: 'inset(0px 0px 0px 0px)' },
        { offset: 1, clipPath: 'inset(0px 0px 0px 0px)' },
      ], timing);
      animation.id = `about-story-image-${index + 2}`;
      return animation;
    }) : [];
    const animations = [textAnimation, ...imageAnimations].filter(Boolean);
    animations.forEach(animation => animation.pause());
    const paint = progress => {
      animations.forEach(animation => { animation.currentTime = progress * 1000; });
      if (!nativeAnimation) {
        const incoming = [0, 1].map(index => reducedMotion
          ? Number(progress >= (index === 0 ? .25 : .75))
          : ease(clamp((progress - (index === 0 ? .125 : .625)) / .25)));
        trackRef.current.style.transform = `translateY(-${(incoming[0] + incoming[1]) * layout.copyHeight}px)`;
        imageRefs.current.slice(1).forEach((image, index) => {
          image.style.clipPath = `inset(${100 * (1 - incoming[index])}% 0px 0px 0px)`;
        });
      }
      section.dataset.progress = progress.toFixed(4);
      section.dataset.stage = progress < .25 ? '1' : progress < .75 ? '2' : '3';
    };
    const playhead = { progress: 0 };
    // A short scrub absorbs wheel steps without restarting either visual track.
    // The same continuous clock runs forwards and backwards without overshoot.
    const smoothProgress = gsap.quickTo(playhead, 'progress', { duration: SCRUB_SECONDS,
      ease: 'power1.out', onUpdate: () => paint(playhead.progress) });
    const settle = progress => {
      smoothProgress.tween.pause();
      playhead.progress = progress;
      paint(progress);
    };
    const trigger = ScrollTrigger.create({
      trigger: section, start: `top ${layout.top}px`, end: `+=${layout.range}`,
      onUpdate: self => reducedMotion ? settle(self.progress) : smoothProgress(self.progress, playhead.progress),
      onRefresh: self => settle(self.progress),
      onLeave: self => settle(self.progress),
      onLeaveBack: self => settle(self.progress),
    });
    const refresh = () => trigger.refresh();
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('pageshow', refresh);
      trigger.kill();
      smoothProgress.tween.kill();
      animations.forEach(animation => animation.cancel());
      trackRef.current?.style.removeProperty('transform');
      imageRefs.current.slice(1).forEach(image => image?.style.removeProperty('clip-path'));
    };
  }, [layout, reducedMotion]);

  return <section ref={sectionRef} id="about-story" className="about-story is-pinned"
    aria-label="My approach to design" data-mode="pinned" data-stage="1" data-progress="0"
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

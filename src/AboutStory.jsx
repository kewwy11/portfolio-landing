import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './about-story.css';

const EASE = 'cubic-bezier(.22, 1, .36, 1)';
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
  const [layout, setLayout] = useState({ pinned: false, frameHeight: 0, range: 0, top: 0, copyHeight: 360 });

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
      const copyHeight = Math.ceil(Math.max(window.innerWidth > 760 ? 360 : 0,
        ...textRefs.current.map(node => node?.getBoundingClientRect().height || 0)));
      frame.style.setProperty('--story-copy-height', `${copyHeight}px`);
      const frameHeight = Math.ceil(frame.getBoundingClientRect().height);
      const viewportHeight = window.innerHeight;
      // Every line must fit before a stage can be pinned. Short screens use flow.
      const pinned = ready && !reducedMotion && typeof Element.prototype.animate === 'function'
        && frameHeight + 8 <= viewportHeight;
      const next = { pinned, frameHeight, copyHeight, range: pinned ? 2 * Math.max(viewportHeight, 500) : 0,
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
  }, [ready, reducedMotion]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!layout.pinned || !section) return;
    const timing = { duration: 1000, fill: 'both', easing: 'linear' };
    const textAnimation = trackRef.current.animate([
      { offset: 0, transform: 'translateY(0px)' },
      { offset: .125, transform: 'translateY(0px)', easing: EASE },
      { offset: .375, transform: `translateY(-${layout.copyHeight}px)` },
      { offset: .625, transform: `translateY(-${layout.copyHeight}px)`, easing: EASE },
      { offset: .875, transform: `translateY(-${2 * layout.copyHeight}px)` },
      { offset: 1, transform: `translateY(-${2 * layout.copyHeight}px)` },
    ], timing);
    textAnimation.id = 'about-story-text';
    const imageAnimations = imageRefs.current.slice(1).map((node, index) => {
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
    });
    const animations = [textAnimation, ...imageAnimations];
    animations.forEach(animation => animation.pause());
    let frame;
    const update = () => {
      frame = undefined;
      const progress = Math.max(0, Math.min(1, (layout.top - section.getBoundingClientRect().top) / layout.range));
      animations.forEach(animation => { animation.currentTime = progress * 1000; });
      section.dataset.progress = progress.toFixed(4);
      section.dataset.stage = progress < .25 ? '1' : progress < .75 ? '2' : '3';
    };
    const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('pageshow', schedule);
      animations.forEach(animation => animation.cancel());
    };
  }, [layout]);

  return <section ref={sectionRef} id="about-story" className={`about-story${layout.pinned ? ' is-pinned' : ''}`}
    aria-label="My approach to design" data-mode={layout.pinned ? 'pinned' : 'flow'} data-stage="1" data-progress="0"
    style={layout.pinned ? { height: `${layout.frameHeight + layout.range}px` } : undefined}>
    <div ref={frameRef} className="story-sticky" aria-hidden="true"
      style={{ '--story-top': `${layout.top}px`, '--story-copy-height': `${layout.copyHeight}px` }}>
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

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './beacon-color-system.css';

const asset = name => `${import.meta.env.BASE_URL}assets/beacon/${name}`;
const colors = { blue: '#0b0bd6', yellow: '#ffaf1d', dark: '#17173d', mist: '#fafafc', lavender: '#e8e9ff' };
const names = { blue: 'Beacon Blue', yellow: 'Beam Yellow', dark: 'Dark Background', mist: 'Mist White', lavender: 'Beam Yellow' };
const palettes = [
  { title: 'Primary Palette', cards: ['dark', 'yellow', 'blue'], ratio: ['blue', 'yellow', 'dark'], widths: [255, 85, 55], labels: ['70%', '20%', '10%'] },
  { title: 'Primary Social media Palette', cards: ['blue', 'lavender', 'mist'], ratio: ['blue', 'lavender', 'mist'], widths: [228, 112, 55], labels: ['60%', '30%', '10%'] },
  { title: 'Secondary Social media Palette', cards: ['yellow', 'dark', 'mist'], ratio: ['yellow', 'dark', 'mist'], widths: [228, 112, 55], labels: ['50%', '30%', '10%'] },
  { title: 'Presentation Palette', cards: ['mist', 'blue', 'dark'], ratio: ['mist', 'blue', 'dark'], widths: [189, 151, 55], labels: ['50%', '40%', '10%'] },
];
const notifications = [
  { photo: 'notification-bracelet.png', alt: 'A woman speaking on her phone', mark: 'yellow', tile: 'dark', shade: .1, message: <>Your Cuban link bracelet has been valued at<br />₦2,450,000.</> },
  { photo: 'notification-storage.png', alt: 'A chef at work in a kitchen', mark: 'blue', tile: 'mist', shade: .2, message: 'Your item is safely stored and insured with us.' },
  { photo: 'notification-loan.png', alt: 'A customer using her phone', mark: 'white', tile: 'blue', shade: 0, message: 'You have received your loan of ₦1,700,000.00' },
];
const badges = [{ background: 'dark', ink: 'yellow' }, { background: 'mist', ink: 'blue' }, { background: 'blue', ink: 'white' }];

const transitionMs = 900;
const pauseMs = 700;

// One shared clock advances only one panel per turn: palette, photo, badge.
// Every transition finishes before the next panel starts.
function useVariantSequence(ref) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    let visible = false;
    const stop = () => clearTimeout(timer);
    const advance = () => { setTick(value => value + 1); timer = setTimeout(advance, transitionMs + pauseMs); };
    const sync = () => {
      stop();
      if (media.matches) setTick(0);
      else if (visible && !document.hidden) timer = setTimeout(advance, transitionMs + pauseMs);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .05 });
    observer.observe(ref.current);
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => { stop(); observer.disconnect(); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, [ref]);
  return tick;
}

function ScaledPanel({ height, className = '', children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    ref.current.style.setProperty('--panel-scale', ref.current.getBoundingClientRect().width / 554);
    const observer = new ResizeObserver(([entry]) => ref.current.style.setProperty('--panel-scale', entry.contentRect.width / 554));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`beacon-color-panel ${className}`} style={{ aspectRatio: `554 / ${height}` }}>
    <div className="beacon-color-canvas" style={{ height }}>{children}</div>
  </div>;
}

export default function BeaconColorSystem() {
  const ref = useRef(null);
  const step = useVariantSequence(ref);
  const paletteTurn = Math.floor((step + 2) / 3);
  const paletteIndex = paletteTurn % palettes.length;
  const photoIndex = Math.floor((step + 1) / 3) % notifications.length;
  const badgeTick = Math.floor(step / 3);
  const badgeIndex = badgeTick % badges.length;
  const palette = palettes[paletteIndex];
  // Derive colours and slots from one clock, including after a resize or effect replay.
  const cardColors = [0, 1, 2].map(id => palette.cards[(id + paletteTurn) % 3]);
  const previousTurn = useRef(paletteTurn);
  useLayoutEffect(() => {
    const root = ref.current;
    const cards = [...root.querySelectorAll('.beacon-color-card')];
    const slots = cards.map((_, id) => (id + paletteTurn) % 3);
    const oldSlots = cards.map((_, id) => (id + previousTurn.current) % 3);
    const ink = color => ['mist', 'lavender'].includes(color) ? colors.dark : '#fff';
    const settle = () => {
      cards.forEach((card, id) => Object.assign(card.style, {
        transform:`translateY(${slots[id] * 75}px)`, zIndex:String(slots[id] * 100),
        backgroundColor:colors[cardColors[id]], color:ink(cardColors[id]),
      }));
      root.dataset.paletteTransitioning = 'false';
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (previousTurn.current === paletteTurn || reduced) {
      previousTurn.current = paletteTurn;
      settle();
      return;
    }
    const starts = cards.map(card => ({
      y: new DOMMatrixReadOnly(getComputedStyle(card).transform).m42,
      depth: Number(getComputedStyle(card).zIndex),
      background: getComputedStyle(card).backgroundColor,
      ink: getComputedStyle(card).color,
    }));
    const blends = cardColors.map((color, id) => ({
      background: gsap.utils.interpolate(starts[id].background, colors[color]),
      ink: gsap.utils.interpolate(starts[id].ink, ink(color)),
    }));
    previousTurn.current = paletteTurn;
    root.dataset.paletteTransitioning = 'true';
    // The native document timeline keeps the same 1.3s duration under mobile
    // load. GSAP's lag-smoothed ticker could fall behind the panel's real-time
    // sequence and have its unfinished card transition replaced by the next one.
    // Bake the existing desktop sine easing, lift and depth into shared frames.
    const animations = cards.map((card, id) => card.animate(
      Array.from({ length: 81 }, (_, frame) => {
        const offset = frame / 80;
        const p = (1 - Math.cos(Math.PI * offset)) / 2;
        const lift = oldSlots[id] === 2 ? Math.sin(Math.PI * p) : 0;
        const y = starts[id].y + (slots[id] * 75 - starts[id].y) * p - lift * 28;
        return { offset, transform:`translateY(${y}px) scale(${1 - lift * .018})`,
          zIndex:Math.round(starts[id].depth + (slots[id] * 100 - starts[id].depth) * p),
          backgroundColor:blends[id].background(p), color:blends[id].ink(p) };
      }), { duration:1300, easing:'linear', fill:'both' },
    ));
    animations[0].onfinish = () => { settle(); animations.forEach(animation => animation.cancel()); };
    return () => { animations.forEach(animation => animation.cancel()); settle(); };
  }, [paletteTurn]);
  const rotation = -18.43 - Math.floor(badgeTick / 3) * 360 - [0, 122.32, 225][badgeIndex];
  return <div ref={ref} id="beacon-color-system" className="beacon-color-system" style={{ '--color-transition': `${transitionMs}ms` }} aria-label="Beacon Trust colour palette and brand applications">
    <ScaledPanel height={750} className="beacon-colors" >
      <div className="beacon-color-stack" data-palette={paletteIndex}>
        {cardColors.map((color, id) => {
          const light = ['mist', 'lavender'].includes(color);
          const ink = light ? 'dark' : color === 'dark' && paletteIndex === 2 ? 'mist' : 'white';
          return <div className="beacon-color-card" key={id} data-color={color} style={{ top:0, '--initial-card-color':colors[palettes[0].cards[id]] }}>
            <div className="beacon-color-card-top"><img src={asset(`palette-mark-${ink}.svg`)} alt="" /><span className="beacon-color-card-menu" style={{ background: color === 'mist' ? '#f5f5f5' : 'rgb(255 255 255 / 20%)' }}><img src={asset(`palette-dots-${ink}.svg`)} alt="" /></span></div>
            <div className="beacon-color-card-label"><span>{names[color]}</span><span>{colors[color].toUpperCase()}</span></div>
          </div>;
        })}
      </div>
      <div className="beacon-color-caption">{palettes.map((state, index) => <p key={state.title} className={index === paletteIndex ? 'is-current' : ''} aria-hidden={index !== paletteIndex}>{state.title}</p>)}</div>
      <div className="beacon-color-ratio" aria-label={palette.title} style={{ backgroundColor:colors[palette.ratio[2]] }}>
        {palette.ratio.map((color, slot) => <span key={slot} style={{ width:palette.widths[slot], backgroundColor:colors[color], color:['mist', 'lavender', 'yellow'].includes(color) ? colors.dark : colors.mist }}>{palette.labels[slot]}</span>)}
      </div>
    </ScaledPanel>
    <div className="beacon-color-right">
      <ScaledPanel height={367} className="beacon-color-photo">
        {notifications.map((notification, index) => <div key={notification.photo} className={`beacon-color-photo-state ${index === photoIndex ? 'is-current' : ''}`} aria-hidden={index !== photoIndex}>
          <img className="beacon-color-photo-image" src={asset(notification.photo)} alt={notification.alt} />
          <div className="beacon-color-photo-shade" style={{ background: `rgb(0 0 0 / ${notification.shade})` }} />
        </div>)}
        <div className={`beacon-color-glass ${photoIndex === 0 ? 'beacon-color-glass-tall' : ''}`} data-notification={photoIndex}>
          <div className="beacon-color-app-icon" style={{ background: colors[notifications[photoIndex].tile] }}>
            {notifications.map((notification, index) => <img key={notification.mark} className={index === photoIndex ? 'is-current' : ''} src={asset(`notification-mark-${notification.mark}.svg`)} alt="" />)}
          </div>
          <div className="beacon-color-notification-copy">
            <div className="beacon-color-notification-title"><strong>Beacon Trust</strong><span>now</span></div>
            <div className="beacon-color-messages">{notifications.map((notification, index) => <p key={notification.photo} className={index === photoIndex ? 'is-current' : ''} aria-hidden={index !== photoIndex}>{notification.message}</p>)}</div>
          </div>
        </div>
      </ScaledPanel>
      <ScaledPanel height={367} className="beacon-color-badge">
        <div className="beacon-color-badge-background" style={{ background: colors[badges[badgeIndex].background] }} data-badge={badgeIndex}>
          <div className="beacon-color-badge-ring" style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}>
            {badges.map((badge, index) => <img key={badge.ink} className={index === badgeIndex ? 'is-current' : ''} src={asset(`seal-ring-${badge.ink}.svg`)} alt={index === badgeIndex ? 'Beacon Trust' : ''} />)}
          </div>
          <div className="beacon-color-badge-symbol">{badges.map((badge, index) => <img key={badge.ink} className={index === badgeIndex ? 'is-current' : ''} src={asset(`seal-symbol-${badge.ink}.svg`)} alt="" />)}</div>
        </div>
      </ScaledPanel>
    </div>
  </div>;
}

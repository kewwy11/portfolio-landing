import BeaconBackgroundVideo from './BeaconBackgroundVideo';
import React, { useEffect, useRef } from 'react';
import './beacon-social-grid.css';

const asset = name => `${import.meta.env.BASE_URL}assets/beacon/${name}`;
const art = name => asset(`mosaic-${name}.svg`);

function Card({ x, y, width = 264, height = 330, className = '', children }) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => ref.current.style.setProperty('--card-scale', entry.contentRect.width / width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width]);
  return <article ref={ref} className={`beacon-grid-card ${className}`} style={{ '--card-left': `${x / 1127 * 100}%`, '--card-top': `${y / 780 * 100}%`, '--card-width': `${width / 1127 * 100}%`, aspectRatio: `${width}/${height}` }}>
    <div className="beacon-grid-card-canvas" style={{ width, height }}>{children}</div>
  </article>;
}

function Lockup({ word = 'imgGroup', mark = 'imgGroup1', top = false }) {
  return <div className={`beacon-grid-lockup ${top ? 'at-top' : ''}`} aria-label="Beacon Trust"><img src={art(mark)} alt="" /><img src={art(word)} alt="Beacon Trust" /></div>;
}
function Footer({ mark = 'imgGroup2', swap = false }) {
  return <footer className={`beacon-grid-footer ${swap ? 'can-swap' : ''}`}><img src={art(mark)} alt="Beacon Trust symbol" /><p>Building better<br />futures together</p></footer>;
}
function Photo({ photo, video, alt, word, mark, top, community = false, ...props }) {
  return <Card {...props} className="beacon-grid-photo">{video ? <BeaconBackgroundVideo className="beacon-grid-photo-art" src={asset(video)} poster={asset(photo)} autoPlay loop muted playsInline preload="metadata" aria-label={alt} /> : <img className={`beacon-grid-photo-art ${community ? 'community-crop' : ''}`} src={asset(photo)} alt={alt} />}<Lockup word={word} mark={mark} top={top} /></Card>;
}
function Approval(props) {
  return <Card {...props} width={263.1} height={328.875} className="beacon-grid-approval"><small className="beacon-grid-handle">@beacon_tc</small><div className="beacon-grid-approval-copy"><img src={art('approval-text')} alt="72%" /><p>of our loans are approved<br />on the same day</p></div><div className="beacon-grid-growth">{[24.666,34.062,18.793,50.506,85.742].map((height, index) => <i key={index} style={{height, '--bar-order': index}} />)}</div></Card>;
}
const loans = [['Cars', '₦2m – 15m', 100], ['Watches', '₦500k – 8m', 78.75], ['Jewellery', '₦300k – 5m', 51], ['Designer bags', '₦200k – 3m', 32.75]];
function LoanCard({ move = false, mark = 'imgGroup3', ...props }) {
  return <Card {...props} className={`beacon-grid-loans ${move ? 'beacon-grid-move' : ''}`}><img className="beacon-grid-top-mark" src={art(mark)} alt="Beacon Trust symbol" /><div className="beacon-grid-loan-heading"><h3>{move ? <>Move fast,<br />validate faster</> : 'What can you borrow?'}</h3><p>Typical loan range by asset</p></div><div className="beacon-grid-loan-bars">{loans.map(([label, range, width]) => <div key={label}><p><span>{label}</span><span>{range}</span></p><i style={{width: `${width}%`}} /></div>)}</div></Card>;
}
export default function BeaconSocialGrid() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => ref.current?.classList.toggle('is-visible', entry.isIntersecting), { threshold: 0 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} id="beacon-social-designs" className="beacon-design-grid" aria-label="Beacon Trust social media design applications">
    <Photo x={0} y={-50} width={264.8} height={331} community photo="mosaic-imgChatGptImageSep162026043837Am1.png" alt="Friends reaching together under a blue sky" />
    <Card x={280.8} y={-40} width={263.159} height={328.949} className="beacon-grid-assets"><small className="beacon-grid-handle">@beacon_tc</small><div className="beacon-grid-pulled-copy" role="img" aria-label="Your assets should work as hard as you.">{[132,161,198].map((width,index) => <div key={index} className="beacon-grid-pulled-line" style={{'--slide-x': `${234.964-width}px`, '--line-order': index}}><img src={art('assets-text')} alt="" style={{top: -index * 35.6}} /></div>)}</div><Lockup word="imgGroup6" mark="imgGroup7" /></Card>
    <LoanCard x={559.96} y={-80} />
    <Card x={839.96} y={-52} width={265.6} height={332} className="beacon-grid-fast"><div className="beacon-grid-fast-heading"><img src={art('fast-text')} alt="Fast means fast" /><p>Time from valuation to cash</p></div><div className="beacon-grid-speed-bars"><div><p><span>Beacon Trust</span><span>4 hours</span></p><i /></div><div><p><span>Traditional lenders</span><span>3 weeks</span></p><i /></div></div><Footer mark="imgGroup8" /></Card>
    <Approval x={0} y={297} />
    <Photo x={279.1} y={304.95} width={263} height={328.75} photo="social-workspace.png" video="train-interior.mp4" alt="Sunlit train interior overlooking the mountains" word="imgGroup9" mark="imgGroup10" top />
    <Card x={558.1} y={266} width={263.159} height={328.949} className="beacon-grid-amount"><small className="beacon-grid-handle">@beacon_tc</small><div className="beacon-grid-amount-copy"><div className="beacon-grid-amount-heading"><img src={art('amount-text')} alt="₦2.4B" /></div><p><span>unlocked for small</span><span>businesses this year.</span></p></div><Footer swap /></Card>
    <Photo x={837.259} y={296} width={265.8} height={332.25} photo="mosaic-imgFrame89.png" alt="Stylist washing a customer's hair" word="imgGroup4" mark="imgGroup5" />
    <Photo x={0} y={641.875} width={264.8} height={331} photo="mosaic-imgFrame89.png" alt="Stylist working in her salon" />
    <LoanCard x={280.8} y={649.7} move mark="imgGroup12" />
    <Approval x={560.8} y={609.9} />
    <LoanCard x={839.9} y={644.25} width={266} height={332.5} mark="imgGroup11" />
  </div>;
}

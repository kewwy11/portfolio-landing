import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import LumisAnimatedHeading from './LumisAnimatedHeading.jsx';
import Media from './Media.jsx';
import './lumis-supporting-screens.css';

const asset = name => `${import.meta.env.BASE_URL}assets/videos/${name}`;
const screens = [
  { title: 'Dashboard', video: 'dashboard.mp4' },
  { title: 'Treatment', video: 'treatment.mp4' },
  { title: 'Appointments', video: 'appointment.mp4' },
  { title: 'Overview', video: 'overview.mp4' },
];

export default function LumisSupportingScreens() {
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const opener = useRef(null);
  const open = (screen, event) => {
    opener.current = event.currentTarget;
    setSelected(screen);
  };
  useEffect(() => {
    if (!selected) return;
    const previousBody = document.body.style.overflow;
    const previousRoot = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousRoot;
      opener.current?.focus({ preventScroll: true });
    };
  }, [selected]);

  return <section id="supporting-screens" className={`lumis-supporting-screens${selected ? ' has-viewer' : ''}`} aria-labelledby="supporting-screens-title">
    <div className="lumis-section-heading">
      <LumisAnimatedHeading label="Supporting screens" title="Other screens on the dashboard" id="supporting-screens-title" />
    </div>
    <div className="lumis-supporting-carousel" aria-label="Supporting dashboard screens">
      <div className="lumis-supporting-track">
        {[0, 1].map(copy => <div className="lumis-supporting-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
          {screens.map(screen => <button type="button" className="lumis-supporting-frame" key={screen.title}
            tabIndex={copy === 1 ? -1 : undefined} aria-label={`View ${screen.title} in full screen`} onClick={event => open(screen, event)}>
            <Media video={`videos/${screen.video}`} alt={`${screen.title} walkthrough`} reducedMotionControls={false} />
            <span className="lumis-supporting-tooltip" aria-hidden="true">Click for full view <span>↗</span></span>
          </button>)}
        </div>)}
      </div>
    </div>
    {selected && createPortal(<dialog ref={dialog} className="lumis-screen-viewer" aria-label={`${selected.title} full view`}
      onCancel={event => { event.preventDefault(); setSelected(null); }}
      onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      <button className="lumis-screen-close" type="button" aria-label="Close full view" onClick={() => setSelected(null)} autoFocus>×</button>
      <div className="lumis-screen-full-frame">
        <video key={selected.video} src={asset(selected.video)} controls autoPlay muted loop playsInline />
      </div>
    </dialog>, document.body)}
  </section>;
}

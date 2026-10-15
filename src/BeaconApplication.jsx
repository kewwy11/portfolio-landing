import React, { useEffect, useRef } from 'react';
import './beacon-application.css';

const asset = name => `${import.meta.env.BASE_URL}assets/beacon/application-${name}`;

function PhoneMockup() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => ref.current.style.setProperty('--phone-scale', entry.contentRect.width / 555.5));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="beacon-application-phone" aria-label="Beacon Trust loan approval notification on a phone">
    <div className="beacon-application-phone-canvas">
      <div className="beacon-application-device">
        <div className="beacon-application-device-frame" />
        <div className="beacon-application-device-border" />
        <div className="beacon-application-device-screen">
          <img className="beacon-application-wallpaper" src={asset('imgWallpaper.png')} alt="Friends enjoying a sunny day outdoors" loading="lazy" />
          <div className="beacon-application-notification-back" />
          <div className="beacon-application-notification">
            <div className="beacon-application-app"><img src={asset('imgGroup1.svg')} alt="" /><span>2</span></div>
            <div className="beacon-application-notification-copy"><div><strong>Beacon Trust</strong><span>now</span></div><p>Approved. ₦4,500,000 on its way. Your watch is stored and insured.</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

export default function BeaconApplication() {
  return <section id="beacon-the-application" className="beacon-application" aria-labelledby="beacon-application-heading">
    <div className="beacon-section-intro beacon-application-intro">
      <h2 id="beacon-application-heading">The Application</h2>
      <p>Finally, the system was put to work. We applied the photography, colour, and logo across a set of mockups to see how the brand holds up in the real world, from roadside billboards and phone screens down to business cards and merch. Seeing it at every scale is what proves a system works.</p>
    </div>
    <div className="beacon-application-gallery">
      <div className="beacon-application-billboard"><img src={asset('imgChatGptImageSep152026105510Pm1.png')} alt="Beacon Trust billboard: Borrowing doesn’t have to feel strange" loading="lazy" /></div>
      <div className="beacon-application-pair">
        <div className="beacon-application-tall beacon-application-street"><img src={asset('imgChatGptImageSep152026114408Pm1.png')} alt="Street poster: It started with a dream and a loan" loading="lazy" /></div>
        <div className="beacon-application-tall beacon-application-business"><img src={asset('imgChatGptImageSep152026114408Pm2.png')} alt="Beacon Trust business cards held by a customer" loading="lazy" /></div>
      </div>
      <div className="beacon-application-pair">
        <div className="beacon-application-cap"><img src={asset('imgFrame1327.png')} alt="Blue Beacon Trust cap with the embroidered brand symbol" loading="lazy" /></div>
        <PhoneMockup />
      </div>
    </div>
  </section>;
}

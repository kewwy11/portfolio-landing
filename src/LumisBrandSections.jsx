import React from 'react';
import './lumis-brand-sections.css';

const root = `${import.meta.env.BASE_URL}assets/lumis-brand/`;
const asset = name => `${root}${name}`;

function Intro({ id, title, children }) {
  return <div className="lumis-brand-section-intro">
    <h2 id={id}>{title}</h2>
    <div className="lumis-brand-intro-copy">{children}</div>
  </div>;
}

function BrandLockup({ className = '' }) {
  return <div className={`lb-lockup ${className}`} aria-label="Lumis">
    <img src={asset('hero-symbol.svg')} alt="" />
    <img src={asset('hero-wordmark.svg')} alt="" />
  </div>;
}

const palette = [
  ['#1d4ed8', '1D4ED8', '29, 78, 216', '0.87, 0.64, 0.00, 0.15'],
  ['#f59e0b', 'F59E0B', '245, 158, 11', '0, 36, 96, 4'],
  ['#0f172a', '0F172A', '15, 23, 42', '0.0, 0.0, 0.0, 0.0'],
  ['#fff8eb', 'FFF8EB', '255, 248, 235', '0, 0.03, 0.08, 0'],
  ['#eff6ff', 'EFF6FF', '239, 246, 255', '0.06, 0.04, 0.00, 0'],
];

function SocialHeader({ dark = false }) {
  return <div className={`lb-social-header${dark ? ' is-dark' : ''}`}>
    <span className="lb-social-avatar"><img src={asset('hero-symbol.svg')} alt="" /></span>
    <span>Lumis</span><span className="lb-social-more">•••</span>
  </div>;
}

function SocialFooter() {
  return <div className="lb-social-footer" aria-hidden="true"><span>♥</span><span>◯</span><span>➤</span><span>♧</span></div>;
}

function Identity() {
  return <section id="lumis-brand-identity" className="lb-section lb-identity" aria-labelledby="lumis-brand-identity-title">
    <Intro id="lumis-brand-identity-title" title="The Identity">
      <p>We designed a logo that reflected what Lumis stood for: care, skin, people, and technology.</p>
      <p>The heart represents care, while cells make up the logo, inspired by what our skin is made of. The circle at the centre represents a person, while the connected forms are inspired by neural networks and modern technology.</p>
      <p>Blue was chosen as the primary colour to represent trust and give the brand a premium feel, while amber, sky blue, and bright butter yellow added warmth and energy.</p>
      <p>For typography, we used Sora for its clean, bold, and easy-to-read character, reflecting clarity and professionalism. It was paired with the geometric DM to bring a more modern, futuristic feel with a subtle nod to technology.</p>
      <p>For social media, we used imagery showing different skin conditions across various skin tones, paired with language that felt fun, lively, and emotional rather than overly clinical.</p>
    </Intro>

    <div className="lb-logo-stage" aria-label="Lumis logo reveal">
      <div className="lb-logo-stage-lockup"><img src={asset('hero-symbol.svg')} alt="" /><img src={asset('hero-wordmark.svg')} alt="" /></div>
    </div>

    <div className="lb-identity-pair">
      <div className="lb-logo-anatomy">
        <img className="lb-anatomy-symbol" src={asset('hero-symbol.svg')} alt="Lumis symbol" />
        <span className="lb-anatomy-callout lb-anatomy-top">The heart shape</span>
        <span className="lb-anatomy-callout lb-anatomy-left">Confidence symbol</span>
        <span className="lb-anatomy-callout lb-anatomy-right">A person</span>
        <span className="lb-anatomy-callout lb-anatomy-bottom">Connected forms</span>
      </div>
      <div className="lb-consultation-card">
        <img src={asset('identity-consultation.png')} alt="A patient talks with a Lumis dermatologist" loading="lazy" />
        <div className="lb-consultation-brand"><p>EST <img src={asset('hero-symbol.svg')} alt="" /> 2026</p><img src={asset('hero-wordmark.svg')} alt="Lumis" /><small>Clarity for every skin<br />London, UK</small></div>
      </div>
    </div>

    <div className="lb-palette" aria-label="Lumis colour palette">
      <img src={asset('identity-skin-closeup.png')} alt="Close-up of skin" loading="lazy" />
      <div className="lb-palette-cards">{palette.map(([color, hex, rgb, cmyk]) =>
        <div className="lb-palette-card" key={hex}>
          <span className="lb-palette-swatch" style={{ backgroundColor: color }} />
          <dl><div><dt>HEX</dt><dd>{hex}</dd></div><div><dt>RGB</dt><dd>{rgb}</dd></div><div><dt>CMYK</dt><dd>{cmyk}</dd></div></dl>
        </div>)}</div>
    </div>

    <div className="lb-type-pair" aria-label="Lumis typography">
      <div className="lb-type-card lb-type-sora"><div className="lb-type-top"><span>Thin</span><span>Headers &amp; Body</span></div><strong>Aa</strong><div className="lb-type-bottom"><span>Sora sans serif</span><span>Primary typeface</span></div></div>
      <div className="lb-type-card lb-type-mono"><div className="lb-type-top"><span>Light</span><span>Supporting &amp; Social media</span></div><strong>Aa</strong><div className="lb-type-bottom"><span>DM Mono - Monospace</span><span>Accent typeface</span></div></div>
    </div>

    <div className="lb-identity-stories" aria-label="Lumis social story concepts">
      <div className="lb-story-card lb-story-poll">
        <div className="lb-story-collage"><img src={asset('identity-story-person-2.png')} alt="Person with freckles" /><img src={asset('identity-story-person-1.png')} alt="Person with acne" /><img src={asset('identity-story-person-4.png')} alt="Person with psoriasis" /><img src={asset('identity-story-person-3.png')} alt="Person with rosacea" /></div>
        <div className="lb-story-ui"><SocialHeader /><p className="lb-story-kicker">POLL OF THE DAY</p><div className="lb-poll"><b>WHAT'S YOUR BIGGEST CONCERN?</b>{['A. Acne','B. Hyperpigmentation','C. Rosacea','D. Eczema','E. Others'].map(option => <span key={option}>{option}</span>)}</div><small>LUMIS SKINCARE INSIGHTS</small></div>
      </div>
      <div className="lb-story-card lb-story-type"><SocialHeader /><small>LUMIS SKINCARE INSIGHTS</small><p>Most people see skin.<br /><br />Lumis dermatologists see patterns, possibilities, risk, progression, and what could be missed.</p><strong>WHAT YOUR<br />DERMA-<br />TOLOGIST<br />SEES.</strong></div>
      <div className="lb-story-card lb-story-stat"><img src={asset('identity-story-person-5.png')} alt="Close-up of skin" loading="lazy" /><div><SocialHeader /><small>DID YOU KNOW?</small><strong>90%</strong><p>AI dermatology<br />tools are biased?</p><small>Discover what Lumis is doing differently.</small></div></div>
    </div>

    <div className="lb-social-pair">
      <div className="lb-social-sample lb-social-dark"><SocialHeader dark /><div className="lb-social-photo"><img src={asset('identity-social-photo-1.png')} alt="Skin analysis campaign for Lumis" loading="lazy" /></div><SocialFooter /></div>
      <div className="lb-social-sample lb-social-light"><SocialHeader /><div className="lb-social-photo"><img src={asset('identity-social-photo-1.png')} alt="Lumis educational social post" loading="lazy" /></div><SocialFooter /><img className="lb-social-next" src={asset('identity-social-photo-2.png')} alt="Another Lumis social post about care" loading="lazy" /></div>
    </div>
  </section>;
}

const voiceTraits = [
  ['Mass', 'Elite', 66], ['Playful', 'Serious', 56], ['Authority', 'Friend', 54],
  ['Classic', 'Innovative', 66], ['Traditional', 'Rebel', 71],
];

function Voice() {
  return <section id="lumis-brand-voice" className="lb-section lb-voice" aria-labelledby="lumis-brand-voice-title">
    <Intro id="lumis-brand-voice-title" title="Lumis Voice"><p>We wanted Lumis to sound conversational, warm, and human. Instead of cold directions or language that made the AI feel like the focus, we used a voice that offered guidance and reassurance. The tone was friendly and emotional while still feeling credible and serious enough for a medical brand.</p></Intro>
    <div className="lb-voice-pair"><div className="lb-voice-traits"><span className="lb-voice-pill">Brand Personality</span>{voiceTraits.map(([from, to, level]) => <div className="lb-voice-row" key={from}><span>{from}</span><div className="lb-voice-meter"><i style={{ width: `${level}%` }} /></div><strong>{to}</strong></div>)}</div>
      <div className="lb-voice-example"><div className="lb-message-stack"><div /><div /><div className="lb-message-front"><p><span className="lb-positive">✦</span> “Your skin is improving, here is what we are seeing”</p><p><span className="lb-negative">×</span> <em>“Scan processed successfully”</em></p></div></div></div>
    </div>
  </section>;
}

const people = [
  ['visual-person-1.png', ['Minimal acne', 'Vitiligo', 'Itchy skin'], 'Petra Johnathan, 33'],
  ['visual-person-2.png', ['Acne vulgaris', 'Rosacea'], 'Jennifer Walker, 28'],
  ['visual-person-3.png', ['Hyper-pigmentation', 'Uneven tone', 'Hormonal imbalance'], 'Precious Mulika, 40'],
];

function Visuals() {
  return <section id="lumis-brand-visuals" className="lb-section lb-visuals" aria-labelledby="lumis-brand-visuals-title">
    <Intro id="lumis-brand-visuals-title" title="Lumis Visuals"><p>We used imagery across different touch points to show Lumis as a part of everyday healthcare. This included doctor consultations, patients in their day-to-day lives, conditions shown across different parts of the body—not just the face—and diagnostic moments through imagery and information cards.</p></Intro>
    <div className="lb-people-grid">{people.map(([file, labels, name]) => <figure className="lb-person-card" key={file}><img src={asset(file)} alt={`Lumis portrait: ${name}`} loading="lazy" /><div className="lb-person-tags">{labels.map(label => <span key={label}>• {label}</span>)}</div><figcaption><span>Lumis</span><span>{name}</span></figcaption></figure>)}</div>
    <div className="lb-visual-pair"><div className="lb-lifestyle"><img src={asset('visual-lifestyle.png')} alt="Lumis care in an everyday home setting" loading="lazy" /><div className="lb-care-menu"><b>♥ &nbsp; Lumis Care</b><span>Personal</span><span>Fitness</span><span>Sleep</span></div></div><div className="lb-visual-consult"><img src={asset('visual-consultation.png')} alt="Lumis dermatologist using a remote diagnostic tool" loading="lazy" /><p>We taught technology to<br />be more inclusive.</p></div></div>
    <div className="lb-visual-pair"><div className="lb-pattern-photo"><img src={asset('visual-skin.png')} alt="Skin condition shown beyond the face" loading="lazy" /><img className="lb-pattern" src={asset('visual-pattern.svg')} alt="" /></div><div className="lb-visual-stat"><p>Most dermatology tools were trained on light skin. Lumis holds 90% diagnostic accuracy across all ten MST tones.</p><div className="lb-stat-dots" aria-hidden="true">{Array.from({ length: 50 }, (_, i) => <i key={i} />)}</div><small><span>Fitzpatrick I – VI, left to right</span><span>One dot = 2%</span></small></div></div>
  </section>;
}

function Application() {
  return <section id="lumis-brand-application" className="lb-section lb-application" aria-labelledby="lumis-brand-application-title">
    <Intro id="lumis-brand-application-title" title="Application"><p>We showed how Lumis could exist in the real world through different brand applications. From billboards that communicated how we wanted people to perceive the brand, to logos applied across merchandise, doctor uniforms, and business cards.</p></Intro>
    <div className="lb-application-gallery">
      <figure className="lb-app-wide"><img src={asset('application-billboard.png')} alt="Lumis billboard in a city setting" loading="lazy" /></figure>
      <div className="lb-app-pair"><div className="lb-app-stack"><img src={asset('application-sign.png')} alt="Lumis sign on a building" loading="lazy" /><img src={asset('application-poster.png')} alt="Lumis street poster" loading="lazy" /></div><figure><img src={asset('application-uniform.png')} alt="Lumis logo on a healthcare uniform" loading="lazy" /></figure></div>
      <div className="lb-app-pair lb-app-cards"><figure><img className="lb-card-background" src={asset('application-card-background.png')} alt="" loading="lazy" /><img className="lb-card-front" src={asset('application-card-front.png')} alt="Lumis business card front" loading="lazy" /><img className="lb-card-back" src={asset('application-card-back.png')} alt="Lumis business card back" loading="lazy" /></figure><figure><img src={asset('application-street.png')} alt="Lumis campaign billboards on a city street" loading="lazy" /></figure></div>
      <div className="lb-app-finale"><div><span>For every</span><img src={asset('application-skin.png')} alt="Close-up of skin" loading="lazy" /><span>skin type</span></div><div><img src={asset('application-skin.png')} alt="Skin texture" loading="lazy" /><p>Every<br />skin tone,<br />every skin<br />condition<br />is included.</p></div></div>
    </div>
  </section>;
}

export default function LumisBrandSections() {
  return <><Identity /><Voice /><Visuals /><Application /></>;
}

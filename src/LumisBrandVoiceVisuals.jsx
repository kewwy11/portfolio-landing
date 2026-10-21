import React from 'react';
import { Artboard } from './LumisBrandIdentity';
import { VoiceTraitsArtwork, VoiceMessageArtwork, PortraitOneArtwork, PortraitTwoArtwork, PortraitThreeArtwork, CareMenuArtwork, ConsultationArtwork, SkinPatternArtwork, AccuracyArtwork } from './LumisFigmaArtwork';
import './lumis-brand-voice-visuals.css';

function Intro({ id, title, children }) {
  return <div className="lumis-brand-section-intro"><h2 id={id}>{title}</h2><div className="lumis-brand-intro-copy"><p>{children}</p></div></div>;
}

export function LumisVoice() {
  return <section id="lumis-brand-voice" className="lb-section lv-voice" aria-labelledby="lumis-brand-voice-title">
    <Intro id="lumis-brand-voice-title" title="Lumis Voice">We wanted Lumis to sound conversational, warm, and human. Instead of cold directions or language that made the AI feel like the focus, we used a voice that offered guidance and reassurance. The tone was friendly and emotional while still feeling credible and serious enough for a medical brand.</Intro>
    <div className="lv-pair">
      <Artboard width={555} height={551}><VoiceTraitsArtwork /></Artboard>
      <Artboard width={555} height={551}><VoiceMessageArtwork /></Artboard>
    </div>
  </section>;
}

export function LumisVisuals() {
  return <section id="lumis-brand-visuals" className="lb-section lv-visuals" aria-labelledby="lumis-brand-visuals-title">
    <Intro id="lumis-brand-visuals-title" title="Lumis Visuals">We used imagery across different touch points to show Lumis as a part of everyday healthcare. This included doctor consultations, patients in their day-to-day lives, conditions shown across different parts of the body not just the face and diagnostic moments through imagery and information cards.</Intro>
    <div className="lv-gallery">
      <div className="lv-portraits">
        <Artboard width={376.33} height={704}><PortraitOneArtwork /></Artboard>
        <Artboard width={376.33} height={704}><PortraitTwoArtwork /></Artboard>
        <Artboard width={375.33} height={704}><PortraitThreeArtwork /></Artboard>
      </div>
      <div className="lv-pair">
        <Artboard width={555.5} height={780}><CareMenuArtwork /></Artboard>
        <Artboard width={555.5} height={780}><ConsultationArtwork /></Artboard>
      </div>
      <div className="lv-pair">
        <Artboard width={555.5} height={780}><SkinPatternArtwork /></Artboard>
        <Artboard width={555.5} height={780}><AccuracyArtwork /></Artboard>
      </div>
    </div>
  </section>;
}

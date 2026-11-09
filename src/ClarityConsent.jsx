import React, { useEffect, useState } from 'react';
import Clarity from '@microsoft/clarity';
import './clarity-consent.css';

const PROJECT_ID = 'z6ik1txewp';
const CONSENT_KEY = 'portfolio-clarity-consent';
let initialized = false;

function readChoice() {
  try {
    const choice = window.localStorage.getItem(CONSENT_KEY);
    return choice === 'granted' || choice === 'denied' ? choice : null;
  } catch {
    return null;
  }
}

function saveChoice(choice) {
  try { window.localStorage.setItem(CONSENT_KEY, choice); } catch { /* Keep this choice for the current page. */ }
}

function startClarity() {
  if (initialized) return;
  initialized = true;
  Clarity.init(PROJECT_ID);
  Clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'granted' });
}

export function openClarityPreferences() {
  window.dispatchEvent(new Event('clarity:open-preferences'));
}

export default function ClarityConsent() {
  const [choice, setChoice] = useState(readChoice);
  const [open, setOpen] = useState(() => readChoice() === null);

  useEffect(() => {
    if (choice === 'granted') startClarity();
  }, [choice]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('clarity:open-preferences', show);
    return () => window.removeEventListener('clarity:open-preferences', show);
  }, []);

  function choose(nextChoice) {
    saveChoice(nextChoice);
    setChoice(nextChoice);
    setOpen(false);
    if (nextChoice === 'granted') startClarity();
    else if (initialized) Clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' });
  }

  if (!open) return null;
  return <aside className="clarity-consent" aria-label="Privacy choices" aria-live="polite">
    <div className="clarity-consent-copy">
      <strong>Help improve this portfolio?</strong>
      <p>Microsoft Clarity uses analytics and session replay to show how visitors use this site. It stays off unless you allow analytics. You can change this choice at any time.</p>
    </div>
    <div className="clarity-consent-actions">
      <button type="button" className="clarity-consent-reject" onClick={() => choose('denied')}>Decline</button>
      <button type="button" className="clarity-consent-accept" onClick={() => choose('granted')}>Allow analytics</button>
      {choice && <button type="button" className="clarity-consent-close" aria-label="Close privacy choices" onClick={() => setOpen(false)}>Close</button>}
    </div>
  </aside>;
}

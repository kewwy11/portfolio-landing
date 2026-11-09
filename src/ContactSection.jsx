import React, { useState } from 'react';
import { contactMedia } from './content.js';
import Media from './Media.jsx';
import LineRevealHeading from './LineRevealHeading.jsx';
import TalkButton from './TalkButton.jsx';
import './contact-fields.css';

const defaultHeading = 'Want to scale your business with a website or an app that converts, create a memorable brand, find your target market, or give your product an entirely different direction? Don’t be a stranger.';

export default function Contact({ heading = defaultHeading }) {
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get('name') || '').trim();
    const visitorEmail = String(form.get('email') || '').trim();
    const message = String(form.get('message') || '').trim();
    if (!name || !visitorEmail || !message) {
      setStatus('Please complete your name, email address, and message.');
      return;
    }
    if (form.get('_gotcha')) return;

    form.set('name', name);
    form.set('email', visitorEmail);
    form.set('message', message);
    form.set('subject', `Portfolio inquiry from ${name}`);
    setSubmitting(true);
    setStatus('Sending your message…');
    try {
      const response = await fetch('https://formspree.io/f/mrppnejr', {
        method: 'POST',
        body: form,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const details = result?.errors?.map(error => error.message).filter(Boolean).join(' ');
        throw new Error(details || (response.status === 429
          ? 'The form is receiving too many messages. Please wait a moment and try again.'
          : 'Your message could not be sent. Please try again.'));
      }
      formElement.reset();
      setStatus("Message sent successfully! I'll get back to you soon.");
    } catch (error) {
      setStatus(error instanceof TypeError
        ? 'We couldn’t connect to the message service. Please check your connection and try again.'
        : error.message || 'Your message could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }
  return <section className="section contact" id="contact" aria-labelledby="contact-heading">
    <div className="contact-copy"><LineRevealHeading id="contact-heading">{heading}</LineRevealHeading>
      <form onSubmit={submit} aria-busy={submitting}>
        <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
        <label htmlFor="email"><span className="square" />Email Address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="robinhood@gmail.com" required maxLength="254" />
        <label htmlFor="name"><span className="square" />Name</label><input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required maxLength="100" />
        <label htmlFor="inquiry"><span className="square" />Inquiry</label><textarea id="inquiry" name="message" rows="1" placeholder="I need a website" required maxLength="2000" />
        <TalkButton disabled={submitting}>{submitting ? 'Sending…' : undefined}</TalkButton>
        <p className="form-status" role="status" aria-live="polite">{status}</p>
      </form>
    </div>
    <Media {...contactMedia} className="contact-image" alt="Visual design film" warmup width="732" height="602" />
  </section>;
}

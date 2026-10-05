import React, { useState } from 'react';
import { email, contactMedia } from './content.js';
import Media from './Media.jsx';
import LineRevealHeading from './LineRevealHeading.jsx';
import TalkButton from './TalkButton.jsx';
import './contact-fields.css';

const defaultHeading = 'Want to scale your business with a website or an app that converts, create a memorable brand, find your target market, or give your product an entirely different direction? Don’t be a stranger.';

export default function Contact({ heading = defaultHeading }) {
  const [status, setStatus] = useState('');
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.get('name')}`);
    const body = encodeURIComponent(`Hello Grateful,\n\n${form.get('inquiry')}\n\nFrom: ${form.get('name')}\nEmail: ${form.get('email')}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setStatus('Your email app will open with your inquiry. Send it there to get in touch, or email me using the link below.');
  }
  return <section className="section contact" id="contact" aria-labelledby="contact-heading">
    <div className="contact-copy"><LineRevealHeading id="contact-heading">{heading}</LineRevealHeading>
      <form onSubmit={submit}>
        <label htmlFor="email"><span className="square" />Email Address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="robinhood@gmail.com" required maxLength="254" />
        <label htmlFor="name"><span className="square" />Name</label><input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required maxLength="100" />
        <label htmlFor="inquiry"><span className="square" />Inquiry</label><textarea id="inquiry" name="inquiry" rows="1" placeholder="I need a website" required maxLength="2000" />
        <TalkButton />
        <p className="form-status" role="status">{status}</p>
      </form>
    </div>
    <Media {...contactMedia} className="contact-image" alt="A close-up of the Piggyvest mobile interface in hand" loading="lazy" width="732" height="602" />
  </section>;
}

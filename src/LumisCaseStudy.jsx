import React, { useEffect, useRef, useState } from 'react';
import './lumis-case-study.css';

const base = import.meta.env.BASE_URL;
const sections = [
  ['Overview', 'overview'], ['Problem', 'problem'], ['Opportunity', 'opportunity'], ['Solution', 'solution'], ['Core flows', 'core-flows'],
  ['Supporting Screens'], ['Research', 'research'], ['Design Decisions', 'design-decisions'], ['Product Considerations', 'product-considerations'], ['Reflection', 'reflection'],
];

const researchComparison = [
  ['Built for', 'Billing and notes', 'Lesion imaging', 'Consumer triage', 'Clinician review of AI'],
  ['Skin tone recorded', 'Not captured', 'Fitzpatrick', 'Not captured', 'Monk, filterable'],
  ['Says when AI is unreliable', 'No AI reading', 'No', 'No', 'Withholds analysis'],
  ['Who confirms the finding', 'Doctor', 'Doctor', 'AI only', 'Doctor, per finding'],
];

const fitzpatrickColours = ['#f5d5c0', '#e8bd9b', '#d29f76', '#b57e56', '#7d4b32', '#4a2c1d'];
const monkColours = ['#f6ede4', '#f3e7db', '#f7ead0', '#eadaba', '#d7bd96', '#a07e56', '#825c43', '#604134', '#3a312a', '#292420'];
const qualityDecisions = [
  { quality: 'Good image', range: 'Quality 75+', actions: [['Show the finding.', 'standard'], ['Show the finding. Flag for review.', 'standard'], ['Show as uncertain. Flag for review.', 'caution']] },
  { quality: 'Fair image', range: 'Quality 50–74', actions: [['Show the finding. Note the image limits.', 'caution'], ['Show, flagged. Suggest a rescan.', 'caution'], ['Withhold severity. Request a rescan.', 'stop']] },
  { quality: 'Poor image', range: 'Below 50', actions: [['Withhold analysis. Request a rescan.', 'stop'], ['Withhold analysis. Request a rescan.', 'stop'], ['Withhold analysis. Request a rescan.', 'stop']] },
];
const confidenceLevels = ['High confidence', 'Medium confidence', 'Low confidence'];
const productConsiderations = [
  ['consideration-environment.png', 'Environment as a clinical input', 'Humidity drives sebum production. UV deepens the dark marks left behind after a breakout heals.'],
  ['consideration-comparison.png', 'Comparison, because change is harder to see', "On darker skin, a healing lesion and an active one can look alike in a single photo, because what's left behind is pigment rather than redness. Two scans side by side is how a doctor tells recovery"],
  ['consideration-treatment.png', 'Treatment that fits where the patient lives', "A regimen that works in a dry climate can fail at 84% humidity, and a product that's easy to buy in one country may not be stocked in another. The treatment templates account for both."],
];
const lessons = [
  ['Designing for two different audiences', 'Designing for both doctors and patients meant balancing clinical detail with clarity. I learned that a useful clinical decision is only half the experience; patients also need to understand what it means for their care.'],
  ["Deciding what the AI shouldn't say", 'I initially struggled with withholding AI results because it felt like a broken experience. But I learned that in healthcare, refusing to give an unreliable answer can be more valuable than giving an immediate one.'],
  ['Designing for disagreement', "I realized that adding a dermatologist to the workflow isn't enough. The challenge is giving them the right evidence to question AI findings, rather than simply approving whatever the system suggests."],
  ['What I still need to validate', "No dermatologist has tested this concept yet. I'd want to see whether reviewing individual findings slows down their workflow, and how to make the process efficient without encouraging doctors to blindly approve everything."],
];

export default function LumisCaseStudy() {
  const [activeSection, setActiveSection] = useState('lumis-hero');
  const firstFlowScene = useRef(null);

  useEffect(() => {
    const nodes = ['lumis-hero', 'overview', 'problem', 'opportunity', 'solution', 'core-flows', 'research', 'design-decisions', 'product-considerations', 'reflection'].map(id => document.getElementById(id)).filter(Boolean);
    let frame;
    const updateActiveSection = () => {
      frame = undefined;
      const readingLine = Math.min(window.innerHeight * .35, 240);
      let current = nodes[0]?.id || 'lumis-hero';
      nodes.forEach(node => {
        if (node.getBoundingClientRect().top <= readingLine) current = node.id;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = nodes.at(-1)?.id || current;
      setActiveSection(active => active === current ? active : current);
    };
    const requestUpdate = () => {
      if (frame === undefined) frame = requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const scene = firstFlowScene.current;
    if (!scene) return undefined;
    const viewport = scene.querySelector('.lumis-scroll-viewport');
    const image = scene.querySelector('.lumis-dashboard-scroll-image');
    let frame;

    const updateScrollPreview = () => {
      frame = undefined;
      const stickyTop = parseFloat(getComputedStyle(viewport).top) || 0;
      const rect = scene.getBoundingClientRect();
      const travel = Math.max(scene.offsetHeight - viewport.offsetHeight, 1);
      const progress = Math.min(1, Math.max(0, (stickyTop - rect.top) / travel));
      const imageOverflow = Math.max(image.offsetHeight - viewport.offsetHeight, 0);
      image.style.transform = `translateY(${-progress * imageOverflow}px)`;
    };
    const requestUpdate = () => {
      if (frame === undefined) frame = requestAnimationFrame(updateScrollPreview);
    };

    updateScrollPreview();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    image.addEventListener('load', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      image.removeEventListener('load', requestUpdate);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="lumis-case-study">
    <a className="skip-link" href="#lumis-hero">Skip to case study</a>
    <aside className="lumis-sidebar">
      <a className="lumis-back" href={`${base}projects`}><img src={`${base}assets/lumis/back-arrow.svg`} alt="" />Back</a>
      <nav aria-label="Case study sections">
        <a className={activeSection === 'lumis-hero' ? 'lumis-section-active' : ''} href="#lumis-hero" aria-current={activeSection === 'lumis-hero' ? 'location' : undefined}>Hero</a>
        {sections.map(([label, id]) => id
          ? <a key={label} className={activeSection === id ? 'lumis-section-active' : ''} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>
          : <span key={label} aria-disabled="true">{label}</span>)}
      </nav>
    </aside>
    <main className="lumis-content" aria-labelledby="lumis-title">
      <div id="lumis-hero" className="lumis-intro">
        <header className="lumis-heading">
          <p>Lumis x Dermatology AI x Concept 2026</p>
          <h1 id="lumis-title">Dermatology without the blind spots</h1>
        </header>
        <figure className="lumis-hero-image">
          <img src={`${base}assets/lumis/scan-review.png`} alt="A dermatologist reviews a facial skin scan on a tablet, with mapped skin concerns and a stylus." fetchPriority="high" />
        </figure>
        <dl className="lumis-details">
          <div><dt>Role</dt><dd>Product Designer<br />Product Researcher<br />Product Strategist<br />Interaction designer</dd></div>
          <div><dt>Timeline</dt><dd className="lumis-timeline">4 weeks</dd></div>
          <div><dt>Team</dt><dd>Solo project</dd></div>
          <div><dt>Industry</dt><dd>Solo project</dd></div>
          <div><dt>Skills</dt><dd>UI Design<br />UX research<br />Product strategy<br />Prototyping</dd></div>
        </dl>
      </div>

      <section id="overview" className="lumis-overview" aria-labelledby="overview-title">
        <div className="lumis-overview-heading">
          <div>
            <p className="lumis-eyebrow">Overview</p>
            <h2 id="overview-title">What makes dermatologists trust AI on dark skin?</h2>
          </div>
          <p className="lumis-overview-summary">This is a self-directed concept exploring the clinician side of Lumis, an AI dermatology platform built for skin of colour.</p>
        </div>
        <div className="lumis-overview-pillars">
          <article><h3>Research &amp; problem framing</h3><p>Understanding why dermatology AI underperforms on darker skin, and where that failure starts.</p></article>
          <img className="lumis-pillar-divider" src={`${base}assets/lumis/section-divider.svg`} alt="" />
          <article><h3>Clinical workflow design</h3><p>Designing a review process where dermatologist and AI can work together to achieve better results.</p></article>
          <img className="lumis-pillar-divider" src={`${base}assets/lumis/section-divider.svg`} alt="" />
          <article><h3>Designing the AI's limits</h3><p>Deciding what the system says, and refuses to say, when it can't read a photo/scan.</p></article>
        </div>
      </section>

      <section id="problem" className="lumis-problem" aria-labelledby="problem-title">
        <header className="lumis-problem-banner">
          <img src={`${base}assets/lumis/problem-skin.jpg`} alt="Close-up of dark skin texture" />
          <div><p>The problem - Cause</p><h2 id="problem-title">Skin AI was trained on skin that doesn’t represent everyone.</h2></div>
        </header>
        <div className="lumis-problem-body">
          <p className="lumis-problem-copy">Dermatology is taught with photographs. A student learns what eczema looks like by seeing a hundred pictures of eczema. Dermatology textbooks have found images of dark skin making up somewhere between 4% and 18% of the total, and in some books, zero images of common conditions like acne or psoriasis on dark skin at all.</p>
          <figure className="lumis-bias-figure">
            <div className="lumis-bias-diagram" aria-label="How the blind spot is inherited">
              <div className="bias-card bias-teaching"><strong>Teaching images</strong><span>4–18% dark skin</span></div>
              <img className="bias-arrow arrow-top-one" src={`${base}assets/lumis/diagram-arrow-right.svg`} alt="" />
              <div className="bias-card bias-model"><strong>Model trained</strong><span>Learns from that pool</span></div>
              <img className="bias-arrow arrow-top-two" src={`${base}assets/lumis/diagram-arrow-right.svg`} alt="" />
              <div className="bias-card bias-alert bias-tested"><strong>Tested on dark skin</strong><span>Accuracy falls by ~a third</span></div>
              <img className="bias-arrow arrow-left-down" src={`${base}assets/lumis/diagram-arrow-down.svg`} alt="" />
              <div className="bias-card bias-doctors"><strong>Doctors trained</strong><span>On the same images</span></div>
              <img className="bias-arrow arrow-bottom" src={`${base}assets/lumis/diagram-arrow-right.svg`} alt="" />
              <div className="bias-card bias-alert bias-label"><strong>They label the training data</strong><span>So the gap feeds itself</span></div>
              <img className="bias-arrow arrow-loop-up" src={`${base}assets/lumis/diagram-arrow-up.svg`} alt="" />
            </div>
            <figcaption>Sources: Lipoff et al., skin tone representation in dermatology textbooks (JAAD, 2020); Daneshjou et al., Disparities in dermatology AI performance on a diverse, curated clinical image set (Science Advances, 2022).</figcaption>
          </figure>
          <p className="lumis-problem-copy">AI learns the same way, from the same pool. When researchers tested well-known skin AI models against a set of dark-skin images with biopsy-confirmed diagnoses, accuracy fell by roughly a third. The same study found that the dermatologists who label training images also performed worse on dark skin. The bias isn't in the code. It's in the pictures, and in the people labelling them.</p>
        </div>
      </section>

      <section id="opportunity" className="lumis-opportunity" aria-labelledby="opportunity-title">
        <header className="lumis-opportunity-banner">
          <img src={`${base}assets/lumis/opportunity-skin.png`} alt="Close-up of a person’s face and skin" />
          <div><p>The opportunity</p><h2>A second opinion only matters<br />when it can challenge the first.</h2></div>
        </header>
        <div className="lumis-opportunity-body">
          <div className="lumis-opportunity-intro">
            <div>
              <p className="lumis-subeyebrow">The gap in the workflow</p>
              <h2 id="opportunity-title">Human review is necessary.<br />But humans make mistakes too.</h2>
            </div>
            <p>Both models and clinicians can miss patterns on underrepresented skin. A safer review process needs more than an approve button: it needs context, a way to disagree, and a way to spot repeated errors.</p>
          </div>
          <div className="lumis-opportunity-cards">
            <article><span>01</span><div><h3>Make limitations visible</h3><p>When the image cannot support a finding, the system should withhold it rather than create false certainty.</p></div><small>Quality gates + uncertainty</small></article>
            <article><span>02</span><div><h3>Design for disagreement</h3><p>Give clinicians the original scan, history and progression first; let them review and override AI findings individually.</p></div><small>Clinical review + comparison</small></article>
            <article><span>03</span><div><h3>Make blind spots measurable</h3><p>Track where clinicians disagree with AI across skin tones, then investigate recurring patterns instead of hiding them in averages.</p></div><small>MST analytics + feedback</small></article>
          </div>
        </div>
      </section>

      <section id="solution" className="lumis-solution" aria-labelledby="solution-title">
        <div className="lumis-section-heading">
          <p className="lumis-eyebrow">The solution</p>
          <h2 id="solution-title">Designing beyond blind trust</h2>
        </div>
        <div className="lumis-better-workflow">
          <div className="lumis-workflow-intro"><p className="lumis-subeyebrow">A better workflow</p><p>The goal is not blind trust in AI or clinicians. It is to give dermatologists the evidence, control and visibility to question uncertain findings.</p></div>
          <div className="lumis-workflow-diagram" aria-label="A safer AI dermatology review workflow">
            <div className="workflow-step workflow-upload"><strong>Patient uploads a scan</strong><span>Phone camera, at home</span></div>
            <img className="workflow-connector workflow-right-one" src={`${base}assets/lumis/workflow-arrow-right.svg`} alt="" />
            <div className="workflow-step workflow-blue workflow-quality"><strong>Image quality check</strong><span>Lighting, focus and clarity</span></div>
            <img className="workflow-connector workflow-right-two" src={`${base}assets/lumis/workflow-arrow-right.svg`} alt="" />
            <div className="workflow-step workflow-analysis"><strong>AI proposes findings</strong><span>Findings and confidence</span></div>
            <img className="workflow-connector workflow-right-three" src={`${base}assets/lumis/workflow-arrow-right.svg`} alt="" />
            <div className="workflow-review-group">
              <div className="workflow-step workflow-blue"><strong>Dermatologist reviews</strong><span>Confirms or overrides findings</span></div>
              <img src={`${base}assets/lumis/workflow-arrow-up.svg`} alt="" /><small>Clinical review</small>
            </div>
            <div className="workflow-unreadable-group">
              <img src={`${base}assets/lumis/workflow-arrow-down.svg`} alt="" />
              <div className="workflow-step workflow-error"><strong>Image is unreadable</strong><span>Withhold analysis and explain<br />why a rescan is needed.</span></div>
              <p>A poor-quality image stops here. It never reaches the AI analysis stage.</p>
            </div>
            <div className="workflow-step workflow-result"><strong>Patient receives reviewed findings</strong><span>Clinician-approved guidance in plain language</span></div>
            <img className="workflow-connector workflow-left" src={`${base}assets/lumis/workflow-arrow-left.svg`} alt="" />
            <div className="workflow-monitor-group">
              <div className="workflow-step workflow-blue"><strong>Recurring discrepancies are investigated</strong><span>Skin-tone disparities and override patterns inform future evaluation</span></div>
              <img src={`${base}assets/lumis/workflow-arrow-up.svg`} alt="" /><small>Performance monitoring</small>
            </div>
            <div className="workflow-loop" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section id="core-flows" className="lumis-core-flows" aria-labelledby="core-flows-title">
        <div className="lumis-section-heading">
          <p className="lumis-eyebrow">Core flows</p>
          <h2 id="core-flows-title">Designing the core experience</h2>
        </div>

        <div className="lumis-flow-list">
          <article className="lumis-flow-item">
            <div className="lumis-scroll-scene" ref={firstFlowScene}>
              <div className="lumis-flow-media lumis-flow-static lumis-scroll-viewport">
                <img className="lumis-dashboard-chrome" src={`${base}assets/lumis/core-flow-bad-scan-tall.png`} alt="" aria-hidden="true" />
                <div className="lumis-dashboard-content-window">
                  <img className="lumis-dashboard-scroll-image" src={`${base}assets/lumis/core-flow-bad-scan-tall.png`} alt="Lumis scan review interface showing an unreadable patient scan" />
                </div>
              </div>
            </div>
            <div className="lumis-flow-copy">
              <h3>When AI doesn't have the answer</h3>
              <p>A poor-quality scan shouldn't produce a confident diagnosis. Lumis flags unreadable images, explains the limitation and requests a rescan.</p>
            </div>
          </article>

          {[
            ['Patients Scan Review', 'Every patient scan is waiting on a doctor review of the AI analysis. So no patient is diagnosed wrongly and nobody gets forgotten between appointments.'],
            ['Designing for disagreement', 'Doctors can independently examine patient evidence, review AI findings and override individual conditions rather than accepting the entire analysis.'],
            ['Following up a patient', "The dermatologist views scans side by side to see how and if the treatment is working, which one photo/scan on its own can't. The AI confidence history and scan graph helps reassure the doctor there is progress in the treatment."],
            ['Making the blind spots visible', 'Tracking AI performance and clinician disagreements across skin tones helps identify recurring disparities that need investigation.'],
          ].map(([title, description], index) => (
            <article className="lumis-flow-item" key={title}>
              <div className="lumis-flow-media lumis-video-placeholder" data-video-slot={index + 1} role="img" aria-label={`${title} video placeholder`}>
                <span>Video coming soon</span>
              </div>
              <div className="lumis-flow-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="research" className="lumis-research" aria-labelledby="research-title">
        <div className="lumis-section-heading">
          <p className="lumis-eyebrow">Research</p>
          <h2 id="research-title">My findings, exploring through articles and datasets</h2>
        </div>
        <figure className="lumis-research-board">
          <img src={`${base}assets/lumis/research-board.png`} alt="Research board with dermatology datasets, competitor analysis, articles, early workflow ideas and skin tone references" loading="lazy" />
        </figure>
        <div className="lumis-research-findings">
          <div className="lumis-research-comparison">
            <h3>Everyone is optimising for something else</h3>
            <div className="lumis-research-table-scroll">
              <table className="lumis-research-table">
                <thead><tr><th scope="col"><span className="sr-only">Criteria</span></th><th scope="col">ModMed EMA</th><th scope="col">DermEngine</th><th scope="col">SkinVision</th><th scope="col">Lumis</th></tr></thead>
                <tbody>{researchComparison.map(([criterion, ...values]) => <tr key={criterion}><th scope="row">{criterion}</th>{values.map((value, index) => <td key={index}>{value}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <p className="lumis-research-source">Assessed from public documentation, demo recordings and user reviews</p>
          </div>

          <div className="lumis-research-tones">
            <h3>Why the dashboard records Monk, not Fitzpatrick</h3>
            <div className="lumis-tone-scale">
              <h4>Fitzpatrick, 1975</h4>
              <p>Six types. Built to predict how skin burns in the sun, not to describe colour — so it has no official hex values.</p>
              <div className="lumis-tone-scroll"><div className="lumis-fitzpatrick-swatches">
                {fitzpatrickColours.map((colour, index) => <div className="lumis-tone-swatch" key={colour}><span style={{ backgroundColor: colour }} /><small>{['I', 'II', 'III', 'IV', 'V', 'VI'][index]}</small></div>)}
                <span className="lumis-tone-note">Swatches illustrative</span>
              </div></div>
            </div>
            <div className="lumis-tone-scale lumis-monk-scale">
              <h4>Monk Skin Tone, 2022</h4>
              <p>Ten shades with published values. Four of them sit in the dark range, where Fitzpatrick has two.</p>
              <div className="lumis-tone-scroll"><div className="lumis-monk-swatches">
                {monkColours.map((colour, index) => <div className={`lumis-tone-swatch${index >= 6 ? ' lumis-tone-dark' : ''}`} key={colour}><span style={{ backgroundColor: colour }} /><small>{index + 1}</small></div>)}
              </div></div>
            </div>
          </div>
        </div>
      </section>
      <section id="design-decisions" className="lumis-design-decisions" aria-labelledby="design-decisions-title">
        <div className="lumis-section-heading">
          <p className="lumis-eyebrow">Design Decisions</p>
          <h2 id="design-decisions-title">How we kept AI in check.</h2>
        </div>
        {[
          {
            number: 'Decision One',
            question: 'How do we give a doctor AI help without replacing their judgement?',
            options: [
              ['design-decision-ai-immediate.png', 'Option A: Show the reading straight away'],
              ['design-decision-ai-on-request.png', 'Option B: Photo first, AI on request.'],
            ],
          },
          {
            number: 'Decision Two',
            question: "What should the AI do when it can't read the photo?",
            options: [
              ['design-decision-withhold.png', 'Option A: Withhold and say why.'],
              ['design-decision-warning.png', 'Option B: Show the reading with a warning.'],
            ],
          },
        ].map(({ number, question, options }) => (
          <article className="lumis-decision" key={question}>
            <div className="lumis-decision-heading">
              <p>{number}</p>
              <h3>{question}</h3>
            </div>
            <div className="lumis-decision-options">
              {options.map(([image, label]) => (
                <figure className="lumis-decision-option" key={image}>
                  <img src={`${base}assets/lumis/${image}`} alt={`${label} dashboard concept`} loading="lazy" />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
            <div className="lumis-decision-outcome">
              <p>Where we landed</p>
              <p>Photo first. AI suggestions on toggle because we want clinicians to think first for themselves and seeing the AI decision first will influence that</p>
            </div>
          </article>
        ))}
        <div className="lumis-quality-matrix">
          <table>
            <thead><tr><th scope="col">QUALITY ↓ &nbsp; CONFIDENCE →</th>{confidenceLevels.map(level => <th scope="col" key={level}>{level}</th>)}</tr></thead>
            <tbody>{qualityDecisions.map(({ quality, range, actions }) => <tr key={quality}>
              <th scope="row">{quality}<span>{range}</span></th>
              {actions.map(([action, state], index) => <td className={`lumis-quality-${state}`} data-confidence={confidenceLevels[index]} key={confidenceLevels[index]}>{action}</td>)}
            </tr>)}</tbody>
          </table>
          <p>Image quality overrides model confidence — a poor photo withholds analysis however certain the model is.</p>
        </div>
      </section>
      <section id="product-considerations" className="lumis-product-considerations" aria-labelledby="product-considerations-title">
        <div className="lumis-section-heading">
          <p className="lumis-eyebrow">Product Considerations</p>
          <h2 id="product-considerations-title">Skin tone was one half, I considered other factors....</h2>
        </div>
        <div className="lumis-considerations-list">
          {productConsiderations.map(([visual, title, description]) => <article className="lumis-consideration" key={title}>
            <figure><img src={`${base}assets/lumis/${visual}`} alt={`${title} interface concept`} loading="lazy" /></figure>
            <div><h3>{title}</h3><p>{description}</p></div>
          </article>)}
        </div>
      </section>
      <section id="reflection" className="lumis-reflection" aria-labelledby="reflection-title">
        <div className="lumis-section-heading">
          <p className="lumis-eyebrow">Reflection</p>
          <h2 id="reflection-title">The lessons</h2>
        </div>
        <div className="lumis-lessons">
          {lessons.map(([title, description]) => <article className="lumis-lesson" key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>)}
        </div>
      </section>
    </main>
  </div>;
}

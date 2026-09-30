import React from 'react';
import { createRoot } from 'react-dom/client';
import Media from '../src/Media.jsx';
import '../src/styles.css';

createRoot(document.getElementById('root')).render(<>
  <div id="video-slot"><Media image="hero-pink.png" video="videos/demo.webm" alt="Demo video" className="hero-inset" width="177" height="100" /></div>
  <div id="still-slot"><Media image="imgFrame14.png" alt="Project image" /></div>
  <div id="broken-slot"><Media image="hero-design.png" video="videos/broken.webm" alt="Poster fallback" /></div>
  <div style={{ height: '2000px' }} />
</>);

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.jsx';
import ClarityConsent from './ClarityConsent.jsx';
import EyesCursor from './EyesCursor.jsx';
import './styles.css';
import './mobile.css';
import './lumis-mobile.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /><EyesCursor /><ClarityConsent /><Analytics /><SpeedInsights /></React.StrictMode>);

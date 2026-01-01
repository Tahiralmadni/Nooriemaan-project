import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize i18n for internationalization
import './config/i18n';

/**
 * Application Entry Point
 * NooriEmaan Digital Portal - Enterprise Cloud ERP
 */
const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

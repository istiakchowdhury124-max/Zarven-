import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence console in client session
if (typeof window !== 'undefined') {
  try {
    const originalError = console.error;
    const originalWarn = console.warn;
    console.error = function(...args) {
      const msg = args.map(a => String(a?.message || a || '')).join(' ');
      if (
        msg.includes('WebSocket') ||
        msg.includes('vite') ||
        msg.includes('favicon') ||
        msg.includes('/u/3/_/upload') ||
        msg.includes('Content Security Policy') ||
        msg.includes('eval')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    console.warn = function(...args) {
      const msg = args.map(a => String(a?.message || a || '')).join(' ');
      if (
        msg.includes('deprecated') ||
        msg.includes('Content Security Policy') ||
        msg.includes('WebSocket')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };
  } catch {}
}

createRoot(document.getElementById('root')!).render(<App />);

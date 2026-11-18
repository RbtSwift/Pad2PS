import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  window.location.protocol !== 'file:' &&
  window.location.protocol !== 'capacitor:'
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration failure in unsupported embedded contexts
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

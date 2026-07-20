import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const optimizeResourceLoading = () => {
  const applyHints = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });

    document.querySelectorAll('video').forEach((video) => {
      if (!video.getAttribute('preload')) {
        video.setAttribute('preload', 'metadata');
      }
    });
  };

  applyHints();

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => applyHints());
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

optimizeResourceLoading();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

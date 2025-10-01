import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DynamicProvider } from './contexts/DynamicContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DynamicProvider>
      <App />
    </DynamicProvider>
  </StrictMode>
);

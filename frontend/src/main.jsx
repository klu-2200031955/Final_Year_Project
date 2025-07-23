import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Buffer } from 'buffer';
import process from 'process';

window.global = window;        // Polyfill `global`
window.Buffer = Buffer;        // Polyfill `Buffer`
window.process = process;      // Polyfill `process`

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

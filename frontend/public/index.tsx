import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../src/App';
import './index.css'; // optional — only if you want global styles

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

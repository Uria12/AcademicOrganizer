import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Create a separate AuthWrapper component
const AuthWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

root.render(
  // Disabled StrictMode to fix react-beautiful-dnd drag and drop issues
  // <React.StrictMode>
    <AuthWrapper />
  // </React.StrictMode>
);
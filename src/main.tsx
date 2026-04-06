import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AdminAppProvider } from './contexts/AdminAppContext';
import { ToastProvider } from './common/ToastContainer';
import ErrorBoundary from './common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AdminAppProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AdminAppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

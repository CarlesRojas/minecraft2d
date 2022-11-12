import React from 'react';
import ReactDOM from 'react-dom/client';
import { EventsProvider } from '@util/Events';
import App from './App';
import '@style/index.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EventsProvider>
      <App />
    </EventsProvider>
  </React.StrictMode>
);

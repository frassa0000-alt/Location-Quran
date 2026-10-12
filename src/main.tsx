import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/notificationService.ts';

// Register service worker for web notifications in production
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);

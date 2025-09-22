import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ensureDictionaryLoaded } from '@/utils/dictionary'

ensureDictionaryLoaded().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

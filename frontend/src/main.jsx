import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary';
import axios from 'axios';

// Set base URL for backend API requests in production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AuthProvider>
    </StrictMode>,
)

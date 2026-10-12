import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { CartProvider } from './context/CartProvider'
import { CheckoutProvider } from './context/CheckoutProvider'
import { AuthProvider } from './context/AuthProvider'
import { initAnalytics } from './lib/analytics'
import './index.css'

// Loads GA4 / Meta Pixel / GTM only when their env IDs are present.
initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              <App />
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { brands, initialBrandId } from './brands'
import './index.css'
import { applyBrand } from './lib/theme'

// Apply the requested brand before the first render so a direct ?brand=salon link
// never flashes the default theme.
applyBrand(brands[initialBrandId(window.location.search)])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

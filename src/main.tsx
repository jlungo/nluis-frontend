import { RouterProvider } from "react-router"
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './app/index'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={App} />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import { store } from './redux/store.js'

export const serverUrl =
  "https://realtimechat-backend-97ae.onrender.com"

// REGISTER PWA
registerSW({
  immediate: true
})

const root =
  createRoot(
    document.getElementById('root')
  )

root.render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/App'
import './ui/styles.css'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
;(window as any).__NBB_RAN__ = true

import App from './App'
import React from 'react'
import ReactDOM from 'react-dom/client'

const field_bounds = document.getElementById('field_bounds')
const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App field={field_bounds} />
  </React.StrictMode>
)

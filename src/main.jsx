import { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./css/styles.css"

createRoot(document.getElementById('root')).render(
  <Fragment>
    <App />
    {<div className="dot" />}
    <div className="bruh">
      <h1>Martini–Henry | .577/450</h1>
      <p>British breech-loading rifle with lever-actuated falling block action</p>
      <p>Model by TastyTony @ Sketchfab</p>
    </div>
  </Fragment>
)

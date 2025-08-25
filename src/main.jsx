import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./css/styles.css"
import tunnel from 'tunnel-rat'

const ui = tunnel();

createRoot(document.getElementById('root')).render(
  <Fragment>
    <App ui={ui}/>
    <ui.Out />
    <div className="bruh">
      <h1>Martini–Henry</h1>
      <p>British breech-loading rifle with lever-actuated falling block action</p>
      <p>Model by TastyTony @ Sketchfab</p>
      <p>SFX by Cturix @ Newgrounds</p>
      <p>Powered by React + R3F / three.js</p>
      <p>TODO</p>
      <ul>
        <li>ejected shell casings</li>
        <li>cartridge collision [need to revisit]</li>
        <li>sfx manager</li>
        <li>particle fx manager</li>
        <li>recoil [sort of done]</li>
        <li>targets</li>
        <li>ui (already have tunnel)</li>
        <li>weapons</li>
        <ul>
          <li>Springfield Model 1873</li>
          <li>H&K G3</li>
          <li>L1A1 + L2A2 SUIT</li>
        </ul>
      </ul>
    </div>
  </Fragment>
)

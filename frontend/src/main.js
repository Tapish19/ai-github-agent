import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { SolveButton } from '../react app'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <div>
      <h1>GitHub Issue Solver</h1>
      <p>Issue Number: 123</p>
      <SolveButton issueNumber={123} />
    </div>
  </React.StrictMode>,
)

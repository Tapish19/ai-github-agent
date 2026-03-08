import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { SolveButton } from '../App'

function App() {
  const [issueNumber, setIssueNumber] = React.useState(1)
  
  return (
    <div>
      <h1>GitHub Issue Solver</h1>
      <div>
        <label>Issue Number: </label>
        <input 
          type="number" 
          value={issueNumber} 
          onChange={(e) => setIssueNumber(parseInt(e.target.value))}
          style={{ marginRight: '10px' }}
        />
      </div>
      <SolveButton issueNumber={issueNumber} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

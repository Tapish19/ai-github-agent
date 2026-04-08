import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import { SolveButton } from '../App'

function App() {
  const [issueNumber, setIssueNumber] = React.useState(1)
  const [result, setResult] = React.useState(null)
  
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
      <SolveButton issueNumber={issueNumber} onResponse={setResult} />

      {result?.type === "loading" && <p>Starting issue solving…</p>}

      {result?.type === "error" && (
        <p style={{ color: "crimson" }}>
          Request failed: {result.payload}
        </p>
      )}

      {result?.type === "success" && (
        <div style={{ marginTop: "16px", textAlign: "left", maxWidth: "720px" }}>
          <p><strong>{result.payload?.message || "Request completed."}</strong></p>
          {result.payload?.prUrl && (
            <p>
              Pull request:{" "}
              <a href={result.payload.prUrl} target="_blank" rel="noreferrer">
                {result.payload.prUrl}
              </a>
            </p>
          )}
          {result.payload?.prError && (
            <p style={{ color: "darkorange" }}>
              PR was not created: {result.payload.prError}
            </p>
          )}
          {result.payload?.patch && (
            <>
              <p>Generated patch:</p>
              <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
                {result.payload.patch}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

import React from 'react'
import axios from "axios"

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "")
  }

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1"

    if (isLocalhost) {
      return "http://localhost:5000"
    }

    if (hostname.includes("frontend")) {
      return origin.replace("frontend", "backend")
    }

    return origin
  }

  return "http://localhost:5000"
}

const API_BASE_URL = resolveApiBaseUrl()
const POLL_INTERVAL_MS = 3000
const MAX_POLL_MS = 5 * 60 * 1000

export function SolveButton({ issueNumber }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState("")
  const [error, setError] = React.useState("")
  const [result, setResult] = React.useState(null)

  const hasOutputDetails = Boolean(result?.prUrl || result?.patch || result?.prError || (Array.isArray(result?.missingEnv) && result.missingEnv.length > 0))

  const pollSolveJob = async (jobId) => {
    const start = Date.now()

    while (Date.now() - start < MAX_POLL_MS) {
      const response = await axios.get(`${API_BASE_URL}/solve/${jobId}`, { timeout: 30000 })
      const job = response.data

      if (job.status === "completed") {
        return job
      }

      if (job.status === "failed") {
        throw new Error(job.error || "Issue solving failed")
      }

      setStatusMessage(job.message || "Issue solving in progress...")
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }

    throw new Error("Issue solving is still running after 5 minutes. Please try again in a moment.")
  }


  const checkBackendHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 })
      if (response?.data?.status !== "ok") {
        throw new Error("Backend health endpoint returned an unexpected response.")
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Backend is unreachable"
      throw new Error(`Backend not reachable at ${API_BASE_URL}: ${msg}`)
    }
  }

  const handleSolve = async () => {
    if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
      setError("Please enter a valid positive issue number.")
      setResult(null)
      setStatusMessage("")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)
    setStatusMessage(`Issue solving started for #${issueNumber}...`)

    try {
      await checkBackendHealth()
      setStatusMessage(`Backend reachable. Starting solve for #${issueNumber}...`)

      const response = await axios.post(
        `${API_BASE_URL}/solve`,
        { issueNumber },
        { timeout: 30000 }
      )

      const solveResponse = response.data

      // Backward-compatible path: backend responds with final payload immediately
      if (!solveResponse.jobId) {
        setResult(solveResponse)
        setStatusMessage("Issue solving completed.")
        return
      }

      setStatusMessage("Issue solving in progress...")
      const finalResult = await pollSolveJob(solveResponse.jobId)
      setResult(finalResult)
      setStatusMessage("Issue solving completed.")
    } catch (err) {
      const isTimeout = err.code === "ECONNABORTED"
      const errorMessage =
        err.response?.data?.error ||
        (isTimeout
          ? "Request timed out while contacting the backend. Check server logs and try again."
          : err.message) ||
        "Unknown error"

      setError(errorMessage)
      setStatusMessage("Issue solving failed.")
      setResult(null)
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        onClick={handleSolve}
        disabled={isLoading}
        style={{ padding: "10px 20px", cursor: isLoading ? "not-allowed" : "pointer" }}
      >
        {isLoading ? "Solving..." : "Solve with AI"}
      </button>

      {statusMessage && <p style={{ marginTop: "10px" }}>{statusMessage}</p>}

      {error && (
        <p style={{ color: "crimson", marginTop: "10px" }}>
          Error: {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: "12px", textAlign: "left" }}>
          <p><strong>Status:</strong> {result.message || "Done"}</p>

          {!hasOutputDetails && (
            <p style={{ color: "darkorange" }}>
              Completed, but backend did not return patch/PR details. Check backend logs and API credentials.
            </p>
          )}

          {result.prUrl ? (
            <p>
              <strong>PR:</strong>{" "}
              <a href={result.prUrl} target="_blank" rel="noreferrer">
                {result.prUrl}
              </a>
            </p>
          ) : (
            <p><strong>PR:</strong> Not available yet.</p>
          )}

          {Array.isArray(result.missingEnv) && result.missingEnv.length > 0 && (
            <p>
              <strong>Missing backend env vars:</strong> {result.missingEnv.join(", ")}
            </p>
          )}

          {result.prError && (
            <p style={{ color: "darkorange" }}>
              <strong>PR creation error:</strong> {result.prError}
            </p>
          )}

          <details style={{ marginTop: "10px" }}>
            <summary><strong>Raw backend response</strong></summary>
            <pre
              style={{
                background: "#111",
                color: "#f8f8f2",
                padding: "12px",
                borderRadius: "6px",
                overflowX: "auto"
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>

          {result.patch ? (
            <>
              <p><strong>Generated patch:</strong></p>
              <pre
                style={{
                  background: "#111",
                  color: "#f8f8f2",
                  padding: "12px",
                  borderRadius: "6px",
                  overflowX: "auto"
                }}
              >
                {result.patch}
              </pre>
            </>
          ) : (
            <p><strong>Generated patch:</strong> Not returned by backend.</p>
          )}
        </div>
      )}
    </div>
  )
}

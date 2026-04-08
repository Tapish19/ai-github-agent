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

export function SolveButton({ issueNumber }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [result, setResult] = React.useState(null)

  const handleSolve = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await axios.post(`${API_BASE_URL}/solve`, { issueNumber })
      setResult(response.data)
      console.log("Issue solving started", response.data)
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      setError(errorMessage)
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

      {error && (
        <p style={{ color: "crimson", marginTop: "10px" }}>
          Error: {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: "12px" }}>
          <p><strong>Status:</strong> {result.message || "Done"}</p>

          {result.prUrl && (
            <p>
              <strong>PR:</strong>{" "}
              <a href={result.prUrl} target="_blank" rel="noreferrer">
                {result.prUrl}
              </a>
            </p>
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

          {result.patch && (
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
          )}
        </div>
      )}
    </div>
  )
}

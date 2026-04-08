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

export function SolveButton({ issueNumber, onResponse }) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSolve = async () => {
    setIsLoading(true)
    onResponse?.({ type: "loading" })

    try {
      const response = await axios.post(`${API_BASE_URL}/solve`, { issueNumber })
      onResponse?.({ type: "success", payload: response.data })
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || "Unknown error"
      onResponse?.({ type: "error", payload: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSolve}
      disabled={isLoading}
      style={{ padding: "10px 20px", cursor: isLoading ? "not-allowed" : "pointer" }}
    >
      {isLoading ? "Solving..." : "Solve with AI"}
    </button>
  )
}

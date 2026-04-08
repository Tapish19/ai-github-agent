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
  const handleSolve = () => {
    axios.post(`${API_BASE_URL}/solve`, { issueNumber })
      .then(() => console.log("Issue solving started"))
      .catch(err => console.error("Error:", err))
  }

  return (
    <button onClick={handleSolve} style={{ padding: "10px 20px", cursor: "pointer" }}>
      Solve with AI
    </button>
  )
}

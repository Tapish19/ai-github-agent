import React from 'react'
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

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

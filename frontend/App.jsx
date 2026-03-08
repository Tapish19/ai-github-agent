import React from 'react'
import axios from "axios"

export function SolveButton({ issueNumber }) {
  const handleSolve = () => {
    axios.post("http://localhost:5000/solve", { issueNumber })
      .then(() => console.log("Issue solving started"))
      .catch(err => console.error("Error:", err))
  }
  
  return (
    <button onClick={handleSolve} style={{ padding: "10px 20px", cursor: "pointer" }}>
      Solve with AI
    </button>
  )
}
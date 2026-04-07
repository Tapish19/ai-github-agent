const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { solveIssue } = require("./agent")

const app = express()
const PORT = process.env.PORT || 5000
const corsOrigin = process.env.CORS_ORIGIN || "*"

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.post("/solve", async (req, res) => {
    try {
        const { issueNumber } = req.body

        if (!issueNumber) {
            return res.status(400).json({ error: "issueNumber is required" })
        }

        console.log("Received request for issue:", issueNumber)

        // Demo mode - return mock response if env vars not set properly
        if (!process.env.GITHUB_TOKEN || !process.env.GEMINI_API_KEY) {
            console.log("Running in demo mode (no API credentials)")
            return res.json({
                message: "AI solving started (demo mode)",
                patch: `--- a/file.js\n+++ b/file.js\n@@ -1,3 +1,3 @@\n// Mock patch\n// This is a demo response\n// Add your actual GitHub and Gemini API keys to .env`
            })
        }

        const result = await solveIssue(issueNumber)
        return res.json(result)
    } catch (error) {
        console.error("Error in /solve:", error.message)
        return res.status(500).json({ error: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

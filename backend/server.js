const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { solveIssue } = require("./agent")

const app = express()


app.use(cors())
app.use(express.json())

app.post("/solve", async (req, res) => {

    try {
        const { issueNumber } = req.body

        console.log("Received request for issue:", issueNumber)

        // Demo mode - return mock response if env vars not set properly
        // we only need a GitHub token and the Gemini API key; the
        // OPENAI_API_KEY check was leftover from an earlier prototype.
        if (!process.env.GITHUB_TOKEN || !process.env.GEMINI_API_KEY) {
            console.log("Running in demo mode (no API credentials)")
            return res.json({ 
                message: "AI solving started (demo mode)",
                patch: `--- a/file.js\n+++ b/file.js\n@@ -1,3 +1,3 @@\n// Mock patch\n// This is a demo response\n// Add your actual GitHub and Gemini API keys to .env`
            })
        }

        // the helper may return {message, patch, prUrl?, prError?}
        const result = await solveIssue(issueNumber)
        res.json(result)
    } catch (error) {
        console.error("Error in /solve:", error.message)
        res.status(500).json({ error: error.message })
    }
})

app.listen(5000, () => {
    console.log("Server running on port 5000")
})
const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { solveIssue } = require("./agent")

const app = express()
const PORT = process.env.PORT || 5000
const corsOrigin = process.env.CORS_ORIGIN || "*"

const requiredEnv = [
    "GITHUB_TOKEN",
    "GITHUB_OWNER",
    "GITHUB_REPO",
    "GEMINI_API_KEY"
]

const jobs = new Map()

function getMissingEnvVars() {
    return requiredEnv.filter((key) => !process.env[key])
}

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

app.get("/", (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "AI Issue Solver backend is running",
        health: "/health"
    })
})

app.get("/health", (req, res) => {
    const missingEnv = getMissingEnvVars()

    return res.status(200).json({
        status: "ok",
        configured: missingEnv.length === 0,
        missingEnv
    })
})

app.get("/solve/:jobId", (req, res) => {
    const { jobId } = req.params
    const job = jobs.get(jobId)

    if (!job) {
        return res.status(404).json({ error: "Job not found" })
    }

    return res.status(200).json(job)
})

app.post("/solve", async (req, res) => {
    try {
        const issueNumber = Number(req.body?.issueNumber)

        if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
            return res.status(400).json({ error: "issueNumber must be a positive integer" })
        }

        console.log("Received request for issue:", issueNumber)

        const missingEnv = getMissingEnvVars()

        // Demo mode - return mock response when deployment secrets are incomplete
        if (missingEnv.length > 0) {
            console.log("Running in demo mode (missing env vars):", missingEnv.join(", "))
            return res.json({
                message: "AI solving started (demo mode)",
                missingEnv,
                patch: `--- a/file.js\n+++ b/file.js\n@@ -1,3 +1,3 @@\n// Mock patch\n// This is a demo response\n// Add required GitHub and Gemini API credentials in Render environment variables`
            })
        }

        const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
        jobs.set(jobId, {
            jobId,
            status: "queued",
            issueNumber,
            createdAt: new Date().toISOString(),
            message: "Issue solving started"
        })

        void (async () => {
            jobs.set(jobId, {
                ...jobs.get(jobId),
                status: "in_progress",
                message: "Issue solving in progress"
            })

            try {
                const result = await solveIssue(issueNumber)
                jobs.set(jobId, {
                    ...jobs.get(jobId),
                    status: "completed",
                    completedAt: new Date().toISOString(),
                    ...result
                })
            } catch (error) {
                console.error("Error in async solve job:", error.message)
                jobs.set(jobId, {
                    ...jobs.get(jobId),
                    status: "failed",
                    completedAt: new Date().toISOString(),
                    error: error.message,
                    message: "Issue solving failed"
                })
            }
        })()

        return res.status(202).json({
            jobId,
            status: "queued",
            message: "Issue solving started"
        })
    } catch (error) {
        console.error("Error in /solve:", error.message)
        return res.status(500).json({ error: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

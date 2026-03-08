const { getIssue, createPullRequest } = require("./githubService")
const { generatePatch } = require("./aiService")

async function solveIssue(issueNumber){

    console.log("Fetching issue:", issueNumber)

    let issue
    try {
        issue = await getIssue(issueNumber)
    } catch (err) {
        // bubble up a friendly message so the HTTP handler can send it
        throw new Error(`Unable to fetch issue #${issueNumber}: ${err.message}`)
    }

    console.log("Issue found:", issue.title)

    const issueText = `
Title: ${issue.title}
Body: ${issue.body}
`

    console.log("Generating fix with AI")

    let patch
    try {
        patch = await generatePatch(issueText)
    } catch (err) {
        throw new Error(`AI generation failed: ${err.message}`)
    }

    let pr
    try {
        pr = await createPullRequest(issueNumber, patch)
    } catch (err) {
        // if the PR creation fails, still return patch but note the error
        console.error("PR creation error:", err.message)
        return {
            message: "AI solving started (patch generated, PR failed)",
            patch,
            prError: err.message
        }
    }

    return {
        message: "AI solving started",
        patch,
        prUrl: pr.html_url
    }
}

module.exports = { solveIssue }
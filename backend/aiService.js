const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const configuredModel = process.env.GEMINI_MODEL?.trim()
const modelCandidates = [
    configuredModel,
    "gemini-2.0-flash",
    "gemini-1.5-flash"
].filter(Boolean)

function isModelNotFoundError(error) {
    return typeof error?.message === "string" &&
        error.message.includes("404") &&
        error.message.includes("models/") &&
        error.message.includes("generateContent")
}

async function generatePatch(issueText) {
    const prompt = `
You are an AI developer.

Given the GitHub issue below, generate a code fix.

Return only the corrected code.

Issue:
${issueText}
`

    let lastError

    for (const modelName of modelCandidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)
            return result.response.text()
        } catch (error) {
            lastError = error

            if (isModelNotFoundError(error)) {
                console.warn(`Gemini model '${modelName}' is unavailable for generateContent, trying fallback model.`)
                continue
            }

            throw error
        }
    }

    throw new Error(
        `No configured Gemini model is available for generateContent. Tried: ${modelCandidates.join(", ")}. Last error: ${lastError?.message || "unknown error"}`
    )
}

module.exports = { generatePatch }

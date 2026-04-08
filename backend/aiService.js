const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const configuredModel = process.env.GEMINI_MODEL?.trim()

const modelCandidates = [
    configuredModel,
    "gemini-2.0-flash-lite",
    "gemini-1.5-pro"
].filter(Boolean)

function isModelNotFoundError(error) {
    return typeof error?.message === "string" &&
        error.message.includes("404") &&
        error.message.includes("models/")
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
            console.log("🚀 Trying model:", modelName)

            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)

            console.log("✅ Success with:", modelName)

            return result.response.text()
        } catch (error) {
            lastError = error

            if (isModelNotFoundError(error)) {
                console.warn(`❌ Model '${modelName}' not supported, trying next...`)
                continue
            }

            console.error("🔥 Unexpected error:", error.message)
            throw error
        }
    }

    throw new Error(
        `No working Gemini model found. Tried: ${modelCandidates.join(", ")}\nLast error: ${lastError?.message}`
    )
}

module.exports = { generatePatch }

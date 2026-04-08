const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function generatePatch(issueText){

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
    })

    const prompt = `
You are an AI developer.

Given the GitHub issue below, generate a code fix.

Return only the corrected code.

Issue:
${issueText}
`

    const result = await model.generateContent(prompt)

    return result.response.text()
}

module.exports = { generatePatch }

# AI Issue Solver

This repository demonstrates a simple service that:

1. Fetches a GitHub issue
2. Sends its title/body to a Gemini model
3. Receives a suggested code patch
4. Opens a pull request containing the patch

---

## Setup

1. Install dependencies for both backend and frontend:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Copy `.env.example` as `.env` inside `backend/` and populate values:

   ```text
   GITHUB_TOKEN=ghp_...
   GITHUB_OWNER=yourusername
   GITHUB_REPO=yourrepo
   GEMINI_API_KEY=ya29...
   ```

   `GITHUB_BASE_BRANCH` is optional and defaults to `main`.

3. Start the backend server:

   ```bash
   cd backend
   node server.js
   ```

4. Optionally run the frontend (it’s a minimal demo UI):

   ```bash
   cd ../frontend
   npm start
   ```

5. Call the API:

   ```bash
   curl -XPOST http://localhost:5000/solve \
     -H "Content-Type: application/json" \
     -d '{"issueNumber":123}'
   ```

   You’ll receive JSON with the generated diff and a link to a newly created PR (or an error if something went wrong).

---

## Development Notes

- `backend/githubService.js` contains GitHub API helpers (`getIssue`, `createPullRequest`).
- `backend/aiService.js` talks to Gemini; modify the prompt for different behavior.
- `backend/agent.js` orchestrates the flow and handles errors.
- The server returns informative errors if issues aren’t found or PR creation fails.

Feel free to build on this prototype!

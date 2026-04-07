# AI Issue Solver

This repository demonstrates a simple service that:

1. Fetches a GitHub issue
2. Sends its title/body to a Gemini model
3. Receives a suggested code patch
4. Opens a pull request with the generated patch in the body

---

## Local setup

1. Install dependencies for both backend and frontend:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Configure backend environment:

   ```bash
   cd ../backend
   cp .env.example .env
   ```

3. Configure frontend environment:

   ```bash
   cd ../frontend
   cp .env.example .env
   ```

4. Start the backend server:

   ```bash
   cd ../backend
   npm start
   ```

5. Run the frontend UI:

   ```bash
   cd ../frontend
   npm run dev
   ```

6. Call the API directly (optional):

   ```bash
   curl -XPOST http://localhost:5000/solve \
     -H "Content-Type: application/json" \
     -d '{"issueNumber":123}'
   ```

---

## Deploy on Render

This repo includes a `render.yaml` blueprint that provisions two services:

- `ai-issue-solver-backend` (Node web service)
- `ai-issue-solver-frontend` (static site)

### Steps

1. Push this repo to GitHub.
2. In Render, choose **New +** → **Blueprint** and connect the repo.
3. Render will detect `render.yaml` and create both services.
4. In the backend service, set secret env vars:
   - `GITHUB_TOKEN`
   - `GITHUB_OWNER`
   - `GITHUB_REPO`
   - `GEMINI_API_KEY`
5. Update domains in `render.yaml` to match your real Render service URLs:
   - `CORS_ORIGIN` on backend
   - `VITE_API_BASE_URL` on frontend

### Health check

After deploy, verify backend health:

```bash
curl https://<your-backend-service>.onrender.com/health
```

---

## Development notes

- `backend/githubService.js` contains GitHub API helpers (`getIssue`, `createPullRequest`).
- `backend/aiService.js` talks to Gemini; modify the prompt for different behavior.
- `backend/agent.js` orchestrates the flow and handles errors.
- The server supports `PORT` and `CORS_ORIGIN` environment variables for deployment.


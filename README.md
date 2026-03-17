# ada-inventory-management-frontend

Enterprise Software Engineering assignment frontend

## Localhost setup (frontend + backend)

### 1. Run your backend repository

- Start your FastAPI backend on `http://localhost:8000`.

### 2. Run this frontend repository

- Install dependencies:

```bash
npm install
```

- Start frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies requests from `/api` to your backend.

### 3. Environment configuration in this repo

- `.env.local` is already configured with:
  - `VITE_API_BASE_URL=/api`
  - `VITE_BACKEND_TARGET=http://localhost:8000`
  - `VITE_API_PREFIX=/api/v1`

If your backend routes do not use `/api/v1`, update `VITE_API_PREFIX` in `.env.local` to match your backend routes.

### 4. How to call backend APIs in frontend code

Use the shared API client at `src/shared/services/apiClient.ts` with URL building from `src/shared/config/env.ts`.

## CORS setup for your environment

For local development in this frontend repo, requests go through the Vite proxy (`/api`), so browser CORS issues are usually avoided.

CORS is configured and owned by your backend repository.

Backend requirement:

- Ensure your backend allows origin `http://localhost:5173` (and `http://127.0.0.1:5173` if needed).
- Keep full CORS configuration details in the backend README.

# Ada Inventory Management - Frontend

Enterprise-grade inventory management system following a three-layer architecture. This repository contains the Frontend implementation built with Vue 3, Tailwind CSS, and Vite.

## Overview

The Ada Inventory Management System provides a robust platform for managing stock, tracking audit histories, and receiving automated alerts. It is designed for scalability and maintains high standards for security and testability.

### Key Features
- User Management: Registration, JWT-based login, password reset workflow, and profile management.
- Inventory Control: Full CRUD operations for items, stock level adjustments, and low-stock threshold monitoring.
- Categorisation: Manage item categories and filter inventory for better organisation.
- Audit History: Transparent tracking of every stock change, including timestamps and the responsible user.
- Automated Alerts: Visual and email-based notifications (via SendGrid) when items fall below their defined thresholds.
- Modern UI: Fully responsive dashboard with search, filtering, and server-side pagination.

---

## Architecture

The system strictly follows a Three-Layer Architecture:

1. Frontend (This Repo): Vue 3 + Tailwind CSS (Client-side presentation and state management).
2. Middleware (Separate Repo): FastAPI Server (Business logic, validation, and authentication).
3. Database: PostgreSQL (Persistent storage via SQLAlchemy ORM).

### Technical Decisions
- Pinia for State Management: Used for global stores (auth, inventory, category, notification) to ensure reactive data flow.
- Modular Feature Design: Code is organised by feature areas (auth, inventory, dashboard) to improve maintainability.
- Centralised API Client: A shared apiClient handles JWT injection, request/response interceptors, and consistent error handling across the app.
- Vite Proxy: Local development uses Vite's proxy to avoid CORS issues when communicating with the FastAPI backend.

---

## Requirements

### Prerequisites
- Node.js: v18 or later
- npm: v9 or later
- Backend: A running instance of the Ada Inventory Management Backend

### Environment Variables
Create a .env.local file in the root directory:

```env
# Frontend requests should use this base URL.
# Keep /api for local development so Vite can proxy to your backend.
VITE_API_BASE_URL=/api

# Backend URL used by Vite dev proxy.
VITE_BACKEND_TARGET=http://localhost:8000

# API prefix used by backend routes.
VITE_API_PREFIX=/api/v1
```

---

## Setup & Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
The app will be available at http://localhost:5173.

### 3. Build for Production
```bash
npm run build
```

---

## Authentication Details

- Implementation: Handled via useAuthStore.ts using JWT (JSON Web Tokens).
- Session Management: Tokens are safely stored in localStorage and automatically injected into every request by the apiClient interceptors.
- Route Protection: Navigation guards in src/router/index.ts verify authentication status before permitting access to protected routes.

---

## Testing & CI/CD

Quality is enforced through rigorous testing and automated pipelines.

### Running Tests
```bash
# Run all vitest unit/component tests
npm run test

# Run tests with coverage report
npm run test:coverage
```

### CI/CD Pipeline
Integrated via GitHub Actions (.github/workflows/pipeline.yml):
- Linting & Formatting: Automated checks on every PR to maintain clean code.
- Automated Tests: Every push must pass the full test suite.
- Coverage Gate: The pipeline will fail if statement coverage drops below 80%.

---

## Deployment

- Hosting: Deployed on Render.
- Frontend URL: [Place your production URL here]
- API URL: [Place your production backend URL here]

---

## Generative AI Usage
I have used Generative AI within my work to help with planning, debugging and documentation drafting in my work. Any use for this was critically checked and manually amended by myself. 

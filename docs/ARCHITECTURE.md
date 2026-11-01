# Architecture overview

This document describes the current high-level layout of SCAMSHIELD AI. It is based on the repository structure and the existing application entry points; it is not a security audit.

## Runtime overview

```text
Browser
  |
  v
React + TypeScript interface (src/)
  |
  | POST /api/analyze/message
  | POST /api/analyze/url
  v
Express server (server.ts)
  |
  v
Server-side analysis modules (server/analyzers, server/services)
  |
  v
Google Gemini API
  |
  v
Structured analysis response
  |
  v
Investigation result UI
```

## Frontend

- `src/main.tsx` mounts the React application.
- `src/App.tsx` coordinates the investigation flow, loading sequence, error state and result display.
- `src/components/` contains the interface components.
- `src/data/` contains supporting data such as demonstration scenarios.
- `src/types.ts` defines shared TypeScript types.
- `src/utils/` contains shared helper logic.

## Backend

- `server.ts` is the Express application entry point.
- `server/analyzers/` contains analysis-related modules.
- `server/services/` contains supporting server-side services.
- The frontend currently calls the message and URL analysis endpoints shown above.

## Configuration and secrets

- Use `.env.example` as a reference for local configuration.
- Keep real Gemini API credentials in server-side environment variables or the deployment platform's secret manager.
- Never expose secrets through frontend bundles or commit a populated `.env` file.

## Important limitations

- Gemini output is probabilistic and can be incorrect or incomplete.
- A risk score is not proof that a message, website or job offer is safe or fraudulent.
- Verify important claims using trusted official sources before acting.
- This overview does not claim that the application has undergone penetration testing or an independent security review.

# SCAMSHIELD AI

> **Pause. Verify. Protect.**  
> An AI-assisted security workspace for investigating suspicious messages, emails, images, job offers and URLs.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=googlegemini&logoColor=white)](https://ai.google.dev/)

## Overview

SCAMSHIELD AI helps people examine potentially fraudulent digital content before they click a link, share information or send money. It combines a React-based investigation interface with server-side Gemini-powered analysis.

The project focuses on understandable risk signals rather than presenting an AI result as a definitive verdict.

## What it can analyse

- **Messages and emails** — inspect text for suspicious language, pressure tactics and requests for money or sensitive information.
- **Images and screenshots** — submit image evidence for multimodal analysis.
- **URLs** — request an AI-assisted review of a potentially suspicious web address.
- **Risk explanations** — view detected warning signs and an investigation result.
- **Demo evidence** — explore curated sample scenarios through the Evidence Library.

## How it works

```text
Message / Email / Image / URL
            |
            v
     Investigation UI
            |
            v
       Express API
            |
            v
    Gemini AI analysis
            |
            v
 Risk signals + explanation
            |
            v
     Investigation view
```

## Technology

| Area | Tools |
|---|---|
| Frontend | React 19, TypeScript |
| Build tooling | Vite, esbuild |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express |
| AI integration | Google GenAI SDK (Gemini) |
| UI & motion | Lucide React, Motion |
| Supporting libraries | D3, TopoJSON |

## Project structure

```text
.
├── server.ts              # Express server and API entry point
├── server/
│   ├── analyzers/         # Analysis logic
│   └── services/          # Server-side services
├── src/
│   ├── components/        # Interface components
│   ├── data/              # Supporting/demo data
│   ├── utils/             # Shared utilities
│   ├── App.tsx            # Main application
│   ├── main.tsx           # Frontend entry point
│   └── types.ts           # TypeScript types
├── index.html
├── package.json
└── vite.config.ts
```

## Run locally

### Prerequisites

- Node.js
- Bun package manager
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/wasimchoudhury27/wasimmmmm.git
cd wasimmmmm
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Keep your API key private. Never commit your real `.env` file or expose the key in frontend code. The repository includes `.env.example` as a reference.

### 4. Start the development server

```bash
bun run dev
```

### 5. Build for production

```bash
bun run build
```

## Responsible use & limitations

- AI-generated risk assessments can be wrong. A low-risk result does **not** prove that a message, website or offer is safe.
- Independently verify recruiters, employers, payment requests and website domains through trusted official channels.
- Do not use this project as a substitute for professional cybersecurity investigation.
- Never submit passwords, OTPs, payment-card details or other highly sensitive information for testing.

## Project context

Developed as a generative-AI and cybersecurity project for **PromptWars × Gen AI Club**.

## Maintainer

**Wasim Choudhury**  
GitHub: [@wasimchoudhury27](https://github.com/wasimchoudhury27)

---

If you find the project useful, consider giving the repository a ⭐.

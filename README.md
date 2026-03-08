# CranialSize

A web application for osteopaths to track and analyze infant cranial measurements.

## Features

- **Google Authentication**: Secure user authentication through Google accounts
- **Patient Registry**: Manage patient records and cranial measurement history
- **Modern UI**: Clean and responsive interface built with Tailwind CSS
- **Data Visualization**: Growth charts and percentile analysis

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: Google OAuth via `@react-oauth/google`
- **Animations**: Framer Motion
- **State**: Zustand

## Getting Started

1. Clone the repository
```bash
git clone git@github.com:igarciadelamo/cranialsize.git
cd cranialsize
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables — create a `.env` file:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=https://your-backend-url.com
```

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID from Google Cloud Console |
| `VITE_API_URL` | Backend API base URL |

## Google Cloud Console setup

Add `http://localhost:3000` to **Authorized JavaScript origins** in your OAuth 2.0 Client ID for local development.

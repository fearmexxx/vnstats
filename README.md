# VNStats - Securities Tracker

A strategic dashboard for tracking the Top 15 securities firms in Vietnam.

## Features
- **Market Share Tracker**: Based on HOSE Q1 2026 data.
- **New Account Estimator**: Calculates firm-specific new accounts based on the official market-wide Excel report.
- **Social Media Monitor**: Tracks Facebook and TikTok follower counts.
- **News Aggregator**: Monitors SSC and major financial news portals.

## Tech Stack
- **Next.js 15+** (App Router)
- **Tailwind CSS**
- **SQLite / Turso** (Database)
- **Recharts** (Data Visualization)

## Database Architecture
- **Local**: Uses local SQLite (`data.db`).
- **Production**: Uses **Turso** for cloud persistence on Vercel.
  - Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel environment variables.

## Deployment on Vercel
1. Push to GitHub.
2. Connect to Vercel.
3. Add Environment Variables:
   - `TURSO_DATABASE_URL`: libsql://your-db-name.turso.io
   - `TURSO_AUTH_TOKEN`: your-auth-token
   - `INGEST_TOKEN`: for secure API ingestion (optional)

## Updating Data
- **Market Share**: Update `src/lib/constants.ts`.
- **New Accounts**: Replace the Excel file in the root and run `node scripts/parse-excel.js`.
- **Social/News**: Hit the `/api/ingest` endpoint or update the JSON files in `src/data/`.

# VNStats - Securities Tracker

A strategic dashboard for tracking the Top 15 securities firms in Vietnam.

## Features
- **Market Share Tracker**: Based on HOSE Q1 2026 data.
- **New Account Estimator**: Calculates firm-specific new accounts based on the official market-wide Excel report.
- **Social Media Monitor**: Tracks Facebook and TikTok follower counts.
- **News Aggregator**: Monitors SSC and major financial news portals.

## Tech Stack
- **Next.js 14+** (App Router)
- **Tailwind CSS**
- **Recharts** (Data Visualization)
- **SheetJS** (Excel Parsing)

## Setup
1. Clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Parse the Excel data (run whenever you have a new file):
   ```bash
   node scripts/parse-excel.js
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel
1. Push to GitHub.
2. Connect to Vercel.
3. Add `INGEST_TOKEN` environment variable for the data update API.

## Updating Data
- **Market Share**: Update `src/lib/constants.ts`.
- **New Accounts**: Replace the Excel file in the root and run `node scripts/parse-excel.js`.
- **Social/News**: Hit the `/api/ingest` endpoint or update the JSON files in `src/data/`.

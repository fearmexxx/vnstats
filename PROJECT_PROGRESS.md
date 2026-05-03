# VNStats Project Progress - May 3, 2026

## 🟢 Completed Today
- **Project Scaffold**: Next.js 14+ (App Router), Tailwind CSS, and Recharts integration.
- **Data Persistence**: SQLite (`data.db`) implemented with tables for firms, social metrics, and market accounts.
- **Excel Intelligence**: Parser script created to extract official market opening data and distribute it by firm market share.
- **Navigation Fix**: All Top 15 firms now have functional dynamic detail pages accessible via the dashboard.
- **Automation**: GitHub Actions workflow set up for weekly data updates (Node 24, Playwright, Write Permissions).
- **Crawl Strategy v2**: Switched to Bing Search to avoid Google bot detection and added support for Vietnamese numerical suffixes (Tr, người theo dõi).

## 🔴 Remaining Issues (For Tomorrow)
- **Social Link Accuracy**: Despite using official legal names, the automated search still occasionally captures low-follower "fan" or "fake" pages.
- **Data Gaps**: Some firms still return "N/A" if the search snippet doesn't match our regex patterns.
- **YouTube Metrics**: Currently using a mock percentage of FB followers; needs actual crawler data.

## 🛠️ Strategy for Tomorrow
1. **Hardcoded Official Links**: For the Top 15, we should create a mapping of their *exact* official social URLs to ensure 100% accuracy.
2. **Direct Page Scraping**: Once we have the official URLs, update the crawler to visit the profile page directly and extract the number from the specific meta tags or DOM elements (bypassing search snippet ambiguity).
3. **Analytics Edge**: Enhance the AI Predictive engine (Gemini) to use the real historical delta once the crawler has populated the DB with accurate week-1 vs week-2 data.

## 📝 Developer Notes
- Database: `data.db`
- Critical Scripts: `scripts/update-data.js`, `scripts/init-db.js`
- Target: Institutional-grade accuracy for the VPS, SSI, and TCBS "Big Three".

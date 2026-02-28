# Inception Mission Control — Setup

## Prerequisites

Install Node.js (v20+):
```bash
# Option A: Official installer
# Download from https://nodejs.org

# Option B: Homebrew (if available)
brew install node

# Option C: nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 20
nvm use 20
```

## Quick Start

```bash
cd /Users/ashish.koshy/Documents/VSCode/inception-mission-control

# 1. Install dependencies
npm install

# 2. Configure API keys
cp .env.example .env.local
# Edit .env.local and fill in:
#   MONDAY_API_TOKEN=...
#   GNEWS_API_KEY=...

# 3. Run
npm run dev

# Open http://localhost:3000
```

## Getting API Keys

### Monday.com Token
1. Go to monday.com → click your profile picture (top-left)
2. Administration → Connections → API
3. Copy your **Personal API Token** (v2)

### GNews API Key
1. Go to https://gnews.io
2. Sign up for free → Dashboard → copy your API key
3. Free tier: **100 requests/day** — sufficient for personal use
   - 3 news categories × 5-min refresh = ~864 calls/day from server
   - Next.js 5-min ISR cache reduces actual origin calls dramatically

## Deploy to Vercel (optional)

```bash
npm install -g vercel
vercel --prod
# Add env vars in Vercel Dashboard → Settings → Environment Variables
```

## Adding a New Widget

1. Create `src/components/widgets/YourWidget/index.tsx`
   - Implement `WidgetProps` interface
   - Use `usePolling` or a custom hook for data
2. Create `src/app/api/your-data/route.ts` (if new API needed)
3. Register in `src/config/widgets.ts` — that's it.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   ├── globals.css         # Bloomberg design tokens + animations
│   └── api/
│       ├── monday/         # Monday.com GraphQL proxy
│       └── news/           # GNews proxy
├── components/
│   ├── layout/             # HeaderBar, DashboardGrid
│   ├── widgets/            # All widget components
│   ├── ui/                 # Shared primitives
│   └── providers/          # DashboardProvider (context)
├── hooks/                  # usePolling, useDubaiTime, useMondayTasks, useNews
├── lib/                    # API clients + transformers
├── types/                  # TypeScript interfaces
└── config/
    └── widgets.ts          # WIDGET_REGISTRY — add widgets here
```

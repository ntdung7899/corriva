# Corriva — Project Structure

```
corriva/
├── app/
│   ├── components/
│   │   ├── AllocationChart.tsx      # Asset allocation donut pie chart
│   │   ├── CircularProgress.tsx     # SVG circular risk score gauge (0-100)
│   │   ├── DashboardLayout.tsx      # Shell: Sidebar + TopNav + content area
│   │   ├── MetricCard.tsx           # Reusable KPI metric card
│   │   ├── PerformanceChart.tsx     # Portfolio vs benchmark area chart
│   │   ├── Sidebar.tsx              # Left sidebar navigation + brand + user
│   │   └── TopNav.tsx               # Sticky top bar with search + notifications
│   │
│   ├── alerts/
│   │   └── page.tsx                 # Alerts page — risk notifications list
│   │
│   ├── portfolio/
│   │   └── page.tsx                 # Portfolio page — asset table + Add Asset
│   │
│   ├── risk-report/
│   │   └── page.tsx                 # Risk Report — VaR, drawdown, AI analysis
│   │
│   ├── settings/
│   │   └── page.tsx                 # Settings — toggles, account links
│   │
│   ├── stress-test/
│   │   └── page.tsx                 # Stress Test — scenario selector + charts
│   │
│   ├── favicon.ico
│   ├── globals.css                  # Design system — CSS tokens, utilities
│   ├── layout.tsx                   # Root layout — Inter font, metadata
│   └── page.tsx                     # Overview page — main dashboard
│
├── public/                          # Static assets
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Tech Stack

| Technology     | Version  | Purpose                        |
|---------------|----------|--------------------------------|
| Next.js       | 16.1.6   | React framework (App Router)   |
| React         | 19.2.3   | UI library                     |
| Tailwind CSS  | 4        | Utility CSS                    |
| Recharts      | latest   | Charts & data visualization    |
| Lucide React  | latest   | Icon system                    |

## Routes

| Route          | Page          |
|---------------|---------------|
| `/`           | Overview      |
| `/portfolio`  | Portfolio     |
| `/risk-report`| Risk Report   |
| `/stress-test`| Stress Test   |
| `/alerts`     | Alerts        |
| `/settings`   | Settings      |

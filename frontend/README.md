# Cursor AI - Frontend

React-based frontend for the Cursor AI full-stack application.

## 🚀 Features

- **Products** - E-commerce product cards with search, filters, sorting
- **Kanban Board** - Drag-and-drop task management
- **Social Feed** - Posts, comments, likes, infinite scroll
- **Dashboard** - Analytics with KPIs, charts, data tables
- **Settings** - User preferences and appearance settings
- **Dark Mode** - Light/dark/system theme support
- **Responsive** - Mobile-first design

## 🛠️ Tech Stack

- React 19
- TypeScript
- Tailwind CSS 4
- React Router
- Vite 7
- Playwright (E2E testing)

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Install Playwright browsers
npx playwright install chromium

# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

## 📁 Project Structure

```
src/
├── components/
│   ├── common/       # Shared components
│   ├── layout/       # Navigation, menus
│   ├── products/     # E-commerce components
│   ├── kanban/       # Task management
│   ├── social/       # Social feed
│   ├── dashboard/    # Analytics
│   └── settings/     # User preferences
├── pages/            # Route pages
├── hooks/            # Custom hooks
├── types/            # TypeScript types
├── data/             # Sample data
└── utils/            # Utilities
```

## 🛤️ Routes

Uses **HashRouter** for GitHub Pages compatibility.

| Path | Component | Description |
|------|-----------|-------------|
| `/#/` | Home | Landing page |
| `/#/products` | Products | Product listings |
| `/#/kanban` | Kanban | Task board |
| `/#/social` | Social | Social feed |
| `/#/profiles` | Profiles | User profiles |
| `/#/team` | Team | Team dashboard |
| `/#/dashboard` | Dashboard | Analytics |
| `/#/settings` | Settings | User settings |


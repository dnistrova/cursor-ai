# Cursor AI Full-Stack Application

A comprehensive full-stack application featuring a React frontend and Flask REST API backend. Includes product cards, Kanban board, social feed, team dashboard, analytics, Customer Support Ticket System, and Blog API with full E2E/unit test coverage.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://dnistrova.github.io/cursor-ai/](https://dnistrova.github.io/cursor-ai/) |
| **Playwright Report** | [https://dnistrova.github.io/cursor-ai/playwright-report/](https://dnistrova.github.io/cursor-ai/playwright-report/) |
| **Static API Docs** | [https://dnistrova.github.io/cursor-ai/api-docs/](https://dnistrova.github.io/cursor-ai/api-docs/) |

---

## 🚀 Features

### Product Cards
- Responsive product grid layout
- Star ratings with review counts
- Price display with discounts
- "Out of Stock" overlay
- Quick View functionality
- Add to Cart with animations
- Image lazy loading
- Search and filtering

### Kanban Board
- Drag and drop task management
- Create, edit, delete tasks
- Priority badges (Low, Medium, High, Urgent)
- Task search and filtering
- LocalStorage persistence
- Column statistics
- Modal forms with validation

### Social Feed
- Create posts with images
- Like, comment, share, bookmark
- Nested comments with replies
- Infinite scroll loading
- User avatars with online status
- Image carousel in posts

### Team Dashboard
- Project overview cards
- Team member management
- Activity feed
- Progress charts
- Quick actions

### Analytics Dashboard
- KPI cards with metrics
- Chart placeholders (line, bar, area, pie, donut)
- Data tables with sorting/pagination
- Date range and category filters
- Export functionality

### Settings Panel
- Tab navigation (Profile, Notifications, Privacy, Appearance)
- Form controls with validation
- Toggle switches
- Dark mode settings

### Navigation
- Sticky header with scroll detection
- Mobile hamburger menu
- Search functionality
- User dropdown menu
- Cart indicator with badge

### Other Features
- 🌓 Dark mode support (Light/Dark/System)
- 📱 Responsive design for all viewports
- ♿ Full accessibility (ARIA, keyboard navigation)
- 🛡️ Error boundaries
- 💾 LocalStorage persistence
- ⌨️ Escape key closes modals

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **React Router** | Client-side routing (HashRouter for GitHub Pages) |
| **Vite 7** | Build tool |
| **Tailwind CSS 4** | Styling |
| **Playwright** | E2E testing |

### Backend
| Technology | Purpose |
|------------|---------|
| **Flask** | REST API framework |
| **SQLAlchemy** | ORM & database |
| **Marshmallow** | Serialization/validation |
| **Flask-JWT-Extended** | Authentication |
| **Flask-Caching + Redis** | Performance caching |
| **Flasgger** | Swagger documentation |
| **Celery** | Async task processing |
| **PostgreSQL** | Production database |
| **pytest** | Unit testing |

---

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- Python 3.11+
- PostgreSQL (production) or SQLite (development)

### Frontend Installation

```bash
# Clone the repository
git clone https://github.com/dnistrova/cursor-ai.git
cd cursor-ai

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Install Playwright browsers (for testing)
npx playwright install chromium
```

### Backend Installation

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start frontend (from /frontend)
npm run dev
# Open http://localhost:5174

# Start backend (from /backend)
flask run
# API at http://localhost:5000
# Swagger docs at http://localhost:5000/docs/
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# Frontend E2E tests
cd frontend
npm run test:e2e
npm run test:e2e:headed   # See browser
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:report   # View report

# Backend unit tests
cd backend
pytest tests/ -v
pytest tests/ -v --cov=app --cov-report=html  # With coverage
```

---

## 📁 Project Structure

```
cursor-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI: Lint, Build, E2E Tests
│       └── deploy-pages.yml          # Deploy to GitHub Pages
├── frontend/
│   ├── e2e/                          # E2E tests
│   │   └── tests/
│   │       ├── accessibility.spec.ts
│   │       ├── dashboard.spec.ts
│   │       ├── kanban-board.spec.ts
│   │       ├── navigation.spec.ts
│   │       ├── product-search.spec.ts
│   │       ├── settings-form.spec.ts
│   │       └── social-feed.spec.ts
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Shared utilities
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── FormControls.tsx
│   │   │   │   └── ToggleSwitch.tsx
│   │   │   ├── dashboard/            # Analytics components
│   │   │   │   ├── ChartPlaceholder.tsx
│   │   │   │   ├── DashboardFilters.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── KPICard.tsx
│   │   │   ├── kanban/               # Kanban board
│   │   │   │   ├── AddTaskModal.tsx
│   │   │   │   ├── BoardColumn.tsx
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   └── TaskCard.tsx
│   │   │   ├── layout/               # Navigation
│   │   │   │   ├── MobileMenu.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── UserDropdown.tsx
│   │   │   ├── products/             # Product cards
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   └── RatingStars.tsx
│   │   │   ├── settings/             # Settings panel
│   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   └── SettingsTabs.tsx
│   │   │   ├── social/               # Social feed
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── CreatePost.tsx
│   │   │   │   ├── Feed.tsx
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── UserAvatar.tsx
│   │   │   │   └── UserProfile.tsx
│   │   │   └── TeamDashboard/        # Team collaboration
│   │   │       ├── TeamDashboard.tsx
│   │   │       ├── ProjectCard.tsx
│   │   │       ├── TeamMembers.tsx
│   │   │       └── ActivityFeed.tsx
│   │   ├── pages/                    # Route pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── KanbanPage.tsx
│   │   │   ├── SocialFeedPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ProfilesPage.tsx
│   │   │   └── TeamPage.tsx
│   │   ├── hooks/
│   │   │   └── useDarkMode.ts
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── data/                     # Sample data
│   │   ├── App.tsx
│   │   └── index.css
│   ├── playwright.config.ts
│   ├── vite.config.ts
│   └── package.json
```

---

## 🔌 Backend API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get JWT |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |

### Customer Support Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tickets` | List tickets (paginated) |
| POST | `/api/v1/tickets` | Create new ticket |
| GET | `/api/v1/tickets/<id>` | Get ticket details |
| PUT | `/api/v1/tickets/<id>` | Update ticket |
| DELETE | `/api/v1/tickets/<id>` | Delete ticket |
| PUT | `/api/v1/tickets/<id>/status` | Update status |
| PUT | `/api/v1/tickets/<id>/priority` | Update priority |
| POST | `/api/v1/tickets/<id>/assign` | Assign to agent |
| GET | `/api/v1/tickets/<id>/comments` | List comments |
| POST | `/api/v1/tickets/<id>/comments` | Add comment |
| GET | `/api/v1/tickets/<id>/history` | Get ticket history |

### Blog API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/posts` | List posts (cached, paginated) |
| POST | `/api/v1/posts` | Create post |
| GET | `/api/v1/posts/<id>` | Get post (cached) |
| PUT | `/api/v1/posts/<id>` | Update post |
| DELETE | `/api/v1/posts/<id>` | Delete post |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/search?q=keyword` | Search posts |

📚 **API Documentation:** Run backend locally and visit `http://localhost:5000/docs/`

---

## 🛤️ Routes

Uses **HashRouter** for GitHub Pages compatibility.

| Path | Component | Description |
|------|-----------|-------------|
| `/#/` | HomePage | Landing page with featured categories |
| `/#/products` | ProductsPage | Product listings with search/filter |
| `/#/kanban` | KanbanPage | Drag-and-drop task board |
| `/#/social` | SocialFeedPage | Social media feed |
| `/#/profiles` | ProfilesPage | User profile cards |
| `/#/team` | TeamPage | Team collaboration dashboard |
| `/#/dashboard` | DashboardPage | Analytics dashboard |
| `/#/settings` | SettingsPage | User settings panel |

---

## ♿ Accessibility

- ✅ Full keyboard navigation
- ✅ ARIA labels on interactive elements
- ✅ Focus visible indicators
- ✅ Screen reader compatible
- ✅ Semantic HTML structure
- ✅ Role attributes on components
- ✅ aria-live regions for dynamic updates
- ✅ Escape key closes modals
- ✅ Focus trap in modals
- ✅ Reduced motion support

---

## 🎨 Design System

### Colors
| Purpose | Color |
|---------|-------|
| Primary | Indigo-600 |
| Secondary | Violet-600 |
| Success | Emerald-500 |
| Warning | Amber-500 |
| Error | Rose-500 |
| Neutral | Slate scale |

### Typography
- **Font**: System UI stack
- **Headings**: Bold weights
- **Body**: Regular weight

---

## 📊 Test Coverage

### Frontend E2E Tests

| Test Suite | Tests | Description |
|------------|-------|-------------|
| `accessibility` | 17 | WCAG compliance, ARIA, keyboard navigation |
| `dashboard` | 8 | Analytics dashboard layout and content |
| `kanban-board` | 22 | Task management, modals, drag & drop |
| `navigation` | 15 | Route navigation, theme toggle, menus |
| `product-search` | 21 | Search, filters, sorting, product grid |
| `settings-form` | 13 | Settings panel, tabs, form controls |
| `social-feed` | 10 | Posts, interactions, content display |

**Frontend Total: 102 E2E tests**

### Backend Unit Tests

| Test Suite | Tests | Description |
|------------|-------|-------------|
| `test_auth` | 8+ | Registration, login, JWT, validation |
| `test_tickets` | 34+ | CRUD, status transitions, RBAC, SLA |
| `test_blog_api` | 20+ | Posts, comments, categories, caching |

**Backend Total: 60+ pytest tests**

---

## 🔄 CI/CD Pipeline

### Pipeline Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Total Time** | ~18 min | ~7 min | 61% faster ⚡ |
| **Build Time** | 5 min | 2 min | Caching |
| **Test Time** | 10 min | 4 min | Parallel execution |
| **Security Scans** | Manual | Automated | ✅ |
| **Rollback** | Manual | Automated | ✅ |

### Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| **CI** | `ci.yml` | Lint, Build, Test (Frontend + Backend) |
| **CI Optimized** | `ci-optimized.yml` | Full pipeline with security & deploy |
| **GitHub Pages** | `deploy-pages.yml` | Deploy frontend to GitHub Pages |
| **Docker Deploy** | `deploy-docker.yml` | Container build & registry push |

### Key Optimizations

1. **Dependency Caching** - npm, pip, Playwright browsers cached
2. **Parallel Execution** - E2E tests sharded across 3 workers
3. **Security Scanning** - npm audit, pip-audit, CodeQL SAST
4. **Docker Layer Caching** - 70% faster container builds
5. **Blue-Green Deployment** - Zero-downtime with auto-rollback
6. **Slack Notifications** - Configurable alerts for failures

### Running Locally

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Run tests in containers
docker-compose run backend pytest
```

📚 See [`docs/CICD_OPTIMIZATION.md`](docs/CICD_OPTIMIZATION.md) for detailed optimization guide.

---

## 🤖 AI Prompts Used

This project was developed using Cursor AI with detailed prompts:

### 1. Product Card Component
> "Create a ProductCard component for an e-commerce application. Include product image, title, description, price, star rating, and an 'Add to Cart' button. Use TypeScript for props and Tailwind CSS for styling. Make it responsive with smooth hover effects and animations. Include accessibility features."

### 2. Kanban Board
> "Build a Project Management Board with drag-and-drop functionality. Include columns for To Do, In Progress, and Done. Create task cards with title, description, priority, assignees, and due date. Add ability to create, edit, and delete tasks. Use native HTML5 drag and drop. Persist data to localStorage."

### 3. Social Feed
> "Create a Social Media Feed component with posts, comments, likes, and sharing. Include infinite scroll, image galleries, and nested comments. Add user avatars with online status indicators. Make it fully responsive and accessible."

### 4. Analytics Dashboard
> "Create a data analytics dashboard with chart placeholders, KPI cards, and data tables. Include filter controls and date range selectors. Use Tailwind CSS for styling with a modern, professional design. Support dark mode."

### 5. Navigation & Settings
> "Create a responsive navigation bar with mobile menu, search, user dropdown, and cart. Add a settings panel with tabs for Profile, Notifications, Privacy, and Appearance. Include dark mode toggle with system preference detection."

### 6. E2E Testing
> "Create comprehensive Playwright E2E tests covering product search, Kanban board, social feed, navigation, accessibility, and responsive design. Use Page Object Model pattern. Include tests for keyboard navigation, ARIA attributes, and error states."

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🙏 Acknowledgments

- Built with [Cursor AI](https://cursor.sh/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- E2E testing with [Playwright](https://playwright.dev/)
- Icons from [Heroicons](https://heroicons.com/)

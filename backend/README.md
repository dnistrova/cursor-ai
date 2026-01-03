# Customer Support Ticket System API

A comprehensive Flask REST API for managing customer support tickets, built according to the PRD specifications.

## 🚀 Features

### Core Functionality (FR-001 to FR-037)
- ✅ **Ticket Management**: Create, read, update, delete tickets
- ✅ **Auto-generated Ticket Numbers**: Format `TICK-YYYYMMDD-XXXX`
- ✅ **Status Workflow**: Open → Assigned → In Progress → Resolved → Closed
- ✅ **Priority Levels**: Low, Medium, High, Urgent with SLA tracking
- ✅ **Categories**: Technical, Billing, General, Feature Request
- ✅ **Ticket Assignment**: Manual and automatic assignment to agents
- ✅ **Comments System**: Public and internal comments
- ✅ **Role-Based Access Control**: Customer, Agent, Admin roles
- ✅ **SLA Management**: Response and resolution time tracking
- ✅ **Search & Filtering**: By status, priority, category, keyword
- ✅ **Admin Dashboard**: Metrics, reports, agent performance

### Technical Features
- ✅ **JWT Authentication**: Secure token-based auth with refresh tokens
- ✅ **Redis Caching**: Response time optimization
- ✅ **Background Tasks**: Celery for email notifications and SLA checks
- ✅ **Swagger UI**: Interactive API documentation
- ✅ **Comprehensive Validation**: Input sanitization and validation
- ✅ **Error Handling**: Standardized error responses
- ✅ **Database Indexes**: Optimized query performance

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py           # App factory
│   ├── extensions.py         # Flask extensions
│   ├── cache.py              # Redis caching utilities
│   ├── celery_app.py         # Celery configuration
│   ├── api/
│   │   ├── __init__.py       # API blueprint
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── users.py          # User management
│   │   ├── tickets.py        # Ticket CRUD & management
│   │   ├── admin.py          # Dashboard & reports
│   │   ├── blog.py           # Blog functionality
│   │   └── errors.py         # Error handlers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py           # User model with roles
│   │   ├── ticket.py         # Ticket, Comment, History
│   │   └── blog.py           # Blog models
│   ├── schemas/
│   │   ├── ticket.py         # Ticket validation
│   │   └── blog.py           # Blog validation
│   ├── tasks/
│   │   ├── email_tasks.py    # Email notifications
│   │   ├── sla_tasks.py      # SLA monitoring
│   │   └── report_tasks.py   # Report generation
│   └── utils/
│       ├── validators.py     # Custom validators
│       └── decorators.py     # RBAC decorators
├── tests/
│   ├── conftest.py           # Test fixtures
│   ├── test_tickets.py       # Ticket tests (25+)
│   ├── test_blog_api.py      # Blog tests
│   └── test_auth.py          # Auth tests
├── config.py                 # Configuration
├── run.py                    # Entry point
└── requirements.txt          # Dependencies
```

## 🛠️ Setup

### Prerequisites
- Python 3.10+
- Redis (for caching)
- PostgreSQL (recommended for production)

### Installation

```bash
# Clone and navigate
cd backend

# Create virtual environment
python -m venv venv

# Activate
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=development
export SECRET_KEY=your-secret-key
export JWT_SECRET_KEY=your-jwt-secret
export DATABASE_URL=sqlite:///app.db
export REDIS_URL=redis://localhost:6379/0

# Run the application
python run.py
```

### Database Setup

```bash
# Initialize migrations
flask db init

# Create migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_tickets.py -v

# Run with verbose output
pytest -v --tb=short
```

## 📚 API Documentation

Access Swagger UI at: **http://localhost:5000/docs/**

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Get current user |

#### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tickets` | List tickets (filtered by role) |
| POST | `/api/v1/tickets` | Create ticket |
| GET | `/api/v1/tickets/:id` | Get ticket details |
| PUT | `/api/v1/tickets/:id` | Update ticket |
| DELETE | `/api/v1/tickets/:id` | Delete ticket (admin) |
| PUT | `/api/v1/tickets/:id/status` | Update status |
| PUT | `/api/v1/tickets/:id/priority` | Update priority |
| POST | `/api/v1/tickets/:id/assign` | Assign to agent (admin) |
| GET | `/api/v1/tickets/:id/comments` | Get comments |
| POST | `/api/v1/tickets/:id/comments` | Add comment |
| GET | `/api/v1/tickets/:id/history` | Get history |

#### Admin & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard` | Dashboard metrics |
| GET | `/api/v1/admin/reports/tickets` | Ticket volume report |
| GET | `/api/v1/admin/reports/agents` | Agent performance |
| GET | `/api/v1/admin/reports/sla` | SLA compliance |
| GET | `/api/v1/agents` | List agents |
| GET | `/api/v1/agents/:id/tickets` | Agent's tickets |

## 🔐 Authentication

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "user",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Create Ticket
```bash
curl -X POST http://localhost:5000/api/v1/tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Cannot login to account",
    "description": "I am unable to login since yesterday. Tried password reset.",
    "priority": "high",
    "category": "technical",
    "customer_email": "customer@example.com"
  }'
```

## 📊 Status Workflow

```
[Open] → [Assigned] → [In Progress] → [Waiting] → [Resolved] → [Closed]
                           ↑              ↓            ↓
                           └──────────────┘            ↓
                                                  [Reopened]
```

### Valid Transitions
- **Open** → Assigned, Closed
- **Assigned** → In Progress, Closed
- **In Progress** → Waiting, Resolved, Closed
- **Waiting** → In Progress
- **Resolved** → Closed, Reopened
- **Closed** → Reopened (within 7 days)
- **Reopened** → In Progress

## ⏱️ SLA Times

| Priority | First Response | Resolution |
|----------|---------------|------------|
| Urgent | 2 hours | 24 hours |
| High | 4 hours | 48 hours |
| Medium | 8 hours | 5 days |
| Low | 24 hours | 10 days |

## 🔒 Role Permissions

| Feature | Customer | Agent | Admin |
|---------|----------|-------|-------|
| Create Ticket | ✅ | ✅ | ✅ |
| View Own Tickets | ✅ | ✅ | ✅ |
| View All Tickets | ❌ | Assigned | ✅ |
| Update Status | ❌ | ✅ | ✅ |
| Assign Tickets | ❌ | ❌ | ✅ |
| Change Priority | ❌ | ✅ | ✅ |
| Internal Comments | ❌ | ✅ | ✅ |
| Delete Tickets | ❌ | ❌ | ✅ |
| View Reports | ❌ | Own Stats | ✅ |

## 🧪 Test Coverage

```
25+ test cases covering:
- Ticket creation & validation (7 tests)
- Ticket number generation (2 tests)
- Assignment system (3 tests)
- Status transitions (4 tests)
- Comments system (4 tests)
- Priority & SLA (3 tests)
- Role-based access (5 tests)
- History tracking (2 tests)
- Search & filtering (4 tests)
```

Run tests: `pytest --cov=app --cov-report=term-missing`

## 📝 Error Response Format

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

### Error Codes
- `VALIDATION_ERROR` (400): Input validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Duplicate resource
- `INTERNAL_ERROR` (500): Server error

## 📄 License

MIT License

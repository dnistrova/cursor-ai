# 🔬 QA Automation Suite

Comprehensive Quality Assurance automation framework for the cursor-ai project.

## 📊 Quality Metrics Targets

| Metric | Target | Status |
|--------|--------|--------|
| Test Coverage | 80%+ | 📊 |
| Code Complexity | <10 | 📊 |
| Critical Vulnerabilities | 0 | 📊 |
| API Response Time (p95) | <500ms | 📊 |
| Error Rate | <1% | 📊 |
| Accessibility Score | 90%+ | 📊 |

## 📁 Directory Structure

```
qa-automation/
├── tests/
│   ├── unit/                    # Unit test utilities
│   │   └── test_utils.py
│   ├── integration/             # API integration tests
│   │   └── test_api_integration.py
│   ├── e2e/                     # End-to-end tests
│   │   └── page_objects/        # Page Object Model
│   │       ├── base_page.py
│   │       ├── login_page.py
│   │       ├── dashboard_page.py
│   │       └── tickets_page.py
│   └── performance/             # Performance tests
├── quality/
│   ├── eslint.config.mjs        # Frontend linting (strict)
│   ├── pylintrc                 # Backend linting
│   └── sonar-project.properties # SonarQube config
├── security/
│   ├── zap-config.yaml          # OWASP ZAP configuration
│   ├── security-scan.sh         # Security scanning script
│   └── .trufflehog-ignore       # Secret scanning ignore
├── performance/
│   ├── k6-load-test.js          # k6 load testing
│   ├── lighthouse.config.js     # Lighthouse CI config
│   └── performance-thresholds.json
├── reports/
│   ├── generate-report.py       # Report generator
│   └── dashboard.html           # Quality dashboard
└── scripts/
    ├── run-all-qa.sh            # Master execution script
    └── analyze-results.py       # Results analyzer
```

## 🚀 Quick Start

### Run All QA Checks

```bash
# Full QA suite
./scripts/run-all-qa.sh

# Quick checks (no performance tests)
./scripts/run-all-qa.sh --quick

# Security checks only
./scripts/run-all-qa.sh --security

# Tests only
./scripts/run-all-qa.sh --tests
```

### Individual Checks

```bash
# Frontend Linting
cd frontend && npm run lint

# Backend Linting
cd backend && pylint app/ --rcfile=../qa-automation/quality/pylintrc

# Security Scan
./security/security-scan.sh

# Performance Test
k6 run performance/k6-load-test.js

# Lighthouse
lhci autorun --config=performance/lighthouse.config.js
```

## 🧪 Test Automation Framework

### Page Object Model (POM)

Our E2E tests use the Page Object Model pattern for maintainability:

```python
from qa_automation.tests.e2e.page_objects import LoginPage, DashboardPage

def test_user_login(page):
    login_page = LoginPage(page)
    login_page.navigate_to_login()
    login_page.login("user@example.com", "password")
    login_page.expect_login_success()
    
    dashboard = DashboardPage(page)
    dashboard.expect_dashboard_loaded()
```

### Base Page Features

- Navigation helpers
- Element interaction (click, fill, select)
- Visibility assertions
- Keyboard interaction
- Screenshot capture

## 🔒 Security Scanning

### Tools Included

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **npm audit** | Frontend dependency vulnerabilities | Built-in |
| **pip-audit** | Backend dependency vulnerabilities | Built-in |
| **Bandit** | Python SAST | `security-scan.sh` |
| **Semgrep** | Multi-language SAST | OWASP rules |
| **TruffleHog** | Secret detection | `.trufflehog-ignore` |
| **OWASP ZAP** | DAST | `zap-config.yaml` |

### Running Security Scans

```bash
# All security checks
./security/security-scan.sh

# OWASP ZAP (Docker)
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t http://localhost:5000/api/v1/swagger.json \
  -f openapi -r zap-report.html
```

## ⚡ Performance Testing

### k6 Load Testing

```bash
# Run load test
k6 run performance/k6-load-test.js

# With custom options
k6 run --vus 50 --duration 5m performance/k6-load-test.js

# With HTML report
k6 run --out json=results.json performance/k6-load-test.js
```

### Test Scenarios

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Smoke | 1 | 30s | Verify system works |
| Load | 20 | 5m | Normal expected load |
| Stress | 100 | 10m | Find breaking point |
| Spike | 200 | 2m | Sudden traffic spike |

### Lighthouse CI

```bash
# Install
npm install -g @lhci/cli

# Run
lhci autorun --config=performance/lighthouse.config.js
```

### Thresholds

See `performance/performance-thresholds.json` for all performance budgets.

## 📊 Quality Dashboard

Open `reports/dashboard.html` in a browser to view the quality dashboard.

Features:
- Overall status indicator
- Category-by-category breakdown
- Metric details with thresholds
- Quality gates status
- Auto-refresh every 60 seconds

### Generate Reports

```bash
# Generate JSON report
python reports/generate-report.py --output reports/qa-report.json

# Analyze results
python scripts/analyze-results.py --reports-dir reports/
```

## 📝 Code Quality Configuration

### ESLint (Frontend)

Strict configuration including:
- Complexity limits (max 10)
- SonarJS rules
- Accessibility rules (jsx-a11y)
- Import ordering
- React hooks rules

### Pylint (Backend)

Strict configuration including:
- Score threshold: 8.0+
- Max function arguments: 6
- Max branches: 12
- Duplicate code detection

### SonarQube

Configuration for SonarQube/SonarCloud analysis:
- Coverage thresholds
- Security hotspots
- Technical debt tracking

## 🔄 CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
qa-checks:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Run QA Suite
      run: |
        chmod +x qa-automation/scripts/run-all-qa.sh
        ./qa-automation/scripts/run-all-qa.sh --quick
    
    - name: Upload Reports
      uses: actions/upload-artifact@v4
      with:
        name: qa-reports
        path: qa-automation/reports/
```

## 📈 Quality Gates

| Gate | Condition | Blocking |
|------|-----------|----------|
| Test Coverage | ≥ 80% | ✅ |
| Critical Vulnerabilities | = 0 | ✅ |
| High Vulnerabilities | = 0 | ✅ |
| Accessibility Score | ≥ 90% | ✅ |
| Code Complexity | < 10 | ⚠️ |
| Duplicate Code | < 5% | ⚠️ |

## 🛠️ Installation

### Prerequisites

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# QA Tools
pip install pylint bandit pip-audit semgrep
npm install -g @lhci/cli

# k6 (macOS)
brew install k6

# k6 (Linux)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## 📚 Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [k6 Documentation](https://k6.io/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [SonarQube Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)


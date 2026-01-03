#!/bin/bash
# =============================================================================
# MASTER QA EXECUTION SCRIPT
# =============================================================================
# Runs all QA checks in sequence:
# 1. Code Quality (ESLint, Pylint, TypeScript)
# 2. Security Scanning (npm audit, pip-audit, Bandit, Semgrep)
# 3. Unit Tests (pytest, Jest)
# 4. E2E Tests (Playwright)
# 5. Performance Tests (Lighthouse, k6)
# 6. Report Generation
#
# Usage:
#   ./run-all-qa.sh              # Run all checks
#   ./run-all-qa.sh --quick      # Run quick checks only (no performance)
#   ./run-all-qa.sh --security   # Run security checks only
#   ./run-all-qa.sh --tests      # Run tests only
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QA_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$QA_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
REPORTS_DIR="$QA_DIR/reports"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$REPORTS_DIR/qa-run-$TIMESTAMP.log"

# Results tracking
declare -A RESULTS
OVERALL_STATUS="PASS"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                 🔬 QA AUTOMATION SUITE                       ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    log "${RED}[FAIL]${NC} $1"
}

record_result() {
    local name=$1
    local status=$2
    local message=$3
    
    RESULTS[$name]="$status|$message"
    
    if [ "$status" == "FAIL" ]; then
        OVERALL_STATUS="FAIL"
    elif [ "$status" == "WARN" ] && [ "$OVERALL_STATUS" != "FAIL" ]; then
        OVERALL_STATUS="WARN"
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# QA CHECK FUNCTIONS
# =============================================================================

run_eslint() {
    print_section "📝 ESLint (Frontend)"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_warning "Frontend directory not found"
        record_result "ESLint" "SKIP" "Directory not found"
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    if npm run lint 2>&1 | tee -a "$LOG_FILE"; then
        log_success "ESLint passed"
        record_result "ESLint" "PASS" "No errors"
    else
        log_error "ESLint found issues"
        record_result "ESLint" "WARN" "Issues found"
    fi
}

run_typescript_check() {
    print_section "📘 TypeScript Check"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        record_result "TypeScript" "SKIP" "Directory not found"
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    if npx tsc --noEmit 2>&1 | tee -a "$LOG_FILE"; then
        log_success "TypeScript check passed"
        record_result "TypeScript" "PASS" "No type errors"
    else
        log_warning "TypeScript found type issues"
        record_result "TypeScript" "WARN" "Type issues found"
    fi
}

run_pylint() {
    print_section "🐍 Pylint (Backend)"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        record_result "Pylint" "SKIP" "Directory not found"
        return
    fi
    
    cd "$BACKEND_DIR"
    
    if check_command pylint; then
        source venv/bin/activate 2>/dev/null || true
        
        if pylint app/ --rcfile="$QA_DIR/quality/pylintrc" --output-format=json > "$REPORTS_DIR/pylint-$TIMESTAMP.json" 2>&1; then
            score=$(python -c "import json; data=json.load(open('$REPORTS_DIR/pylint-$TIMESTAMP.json')); print(data.get('score', 0))" 2>/dev/null || echo "0")
            log_success "Pylint passed (score: $score)"
            record_result "Pylint" "PASS" "Score: $score"
        else
            log_warning "Pylint found issues"
            record_result "Pylint" "WARN" "Issues found"
        fi
    else
        log_warning "Pylint not installed"
        record_result "Pylint" "SKIP" "Not installed"
    fi
}

run_security_scan() {
    print_section "🔒 Security Scanning"
    
    # NPM Audit
    log_info "Running npm audit..."
    cd "$FRONTEND_DIR"
    npm audit --json > "$REPORTS_DIR/security/npm-audit-$TIMESTAMP.json" 2>&1 || true
    
    CRITICAL=$(grep -c '"severity": "critical"' "$REPORTS_DIR/security/npm-audit-$TIMESTAMP.json" 2>/dev/null || echo "0")
    HIGH=$(grep -c '"severity": "high"' "$REPORTS_DIR/security/npm-audit-$TIMESTAMP.json" 2>/dev/null || echo "0")
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        log_error "npm audit: $CRITICAL critical, $HIGH high vulnerabilities"
        record_result "npm audit" "FAIL" "$CRITICAL critical, $HIGH high"
    else
        log_success "npm audit passed"
        record_result "npm audit" "PASS" "No critical/high"
    fi
    
    # Pip Audit
    if check_command pip-audit; then
        log_info "Running pip-audit..."
        cd "$BACKEND_DIR"
        pip-audit -r requirements.txt --format json > "$REPORTS_DIR/security/pip-audit-$TIMESTAMP.json" 2>&1 || true
        
        VULNS=$(grep -c '"id"' "$REPORTS_DIR/security/pip-audit-$TIMESTAMP.json" 2>/dev/null || echo "0")
        if [ "$VULNS" -gt 0 ]; then
            log_warning "pip-audit: $VULNS vulnerabilities found"
            record_result "pip-audit" "WARN" "$VULNS vulnerabilities"
        else
            log_success "pip-audit passed"
            record_result "pip-audit" "PASS" "No vulnerabilities"
        fi
    fi
    
    # Bandit
    if check_command bandit; then
        log_info "Running Bandit..."
        cd "$BACKEND_DIR"
        bandit -r app/ -f json -o "$REPORTS_DIR/security/bandit-$TIMESTAMP.json" 2>&1 || true
        
        HIGH=$(grep -c '"severity": "HIGH"' "$REPORTS_DIR/security/bandit-$TIMESTAMP.json" 2>/dev/null || echo "0")
        if [ "$HIGH" -gt 0 ]; then
            log_warning "Bandit: $HIGH high severity issues"
            record_result "Bandit" "WARN" "$HIGH high severity"
        else
            log_success "Bandit passed"
            record_result "Bandit" "PASS" "No high severity"
        fi
    fi
}

run_backend_tests() {
    print_section "🧪 Backend Tests (pytest)"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        record_result "pytest" "SKIP" "Directory not found"
        return
    fi
    
    cd "$BACKEND_DIR"
    source venv/bin/activate 2>/dev/null || true
    
    if pytest tests/ -v --tb=short --json-report --json-report-file="$REPORTS_DIR/pytest-$TIMESTAMP.json" 2>&1 | tee -a "$LOG_FILE"; then
        PASSED=$(grep -o '"passed": [0-9]*' "$REPORTS_DIR/pytest-$TIMESTAMP.json" 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "0")
        FAILED=$(grep -o '"failed": [0-9]*' "$REPORTS_DIR/pytest-$TIMESTAMP.json" 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "0")
        
        if [ "$FAILED" -eq 0 ]; then
            log_success "pytest: $PASSED tests passed"
            record_result "pytest" "PASS" "$PASSED passed"
        else
            log_error "pytest: $FAILED tests failed"
            record_result "pytest" "FAIL" "$FAILED failed"
        fi
    else
        log_error "pytest execution failed"
        record_result "pytest" "FAIL" "Execution error"
    fi
}

run_e2e_tests() {
    print_section "🎭 E2E Tests (Playwright)"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        record_result "Playwright" "SKIP" "Directory not found"
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    # Build first if needed
    if [ ! -d "dist" ]; then
        log_info "Building frontend..."
        npm run build 2>&1 | tee -a "$LOG_FILE"
    fi
    
    if npm run test:e2e -- --project=chromium 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Playwright tests passed"
        record_result "Playwright" "PASS" "All tests passed"
    else
        log_error "Playwright tests failed"
        record_result "Playwright" "FAIL" "Tests failed"
    fi
    
    # Copy report
    if [ -d "playwright-report" ]; then
        cp -r playwright-report "$REPORTS_DIR/playwright-$TIMESTAMP"
    fi
}

run_lighthouse() {
    print_section "💡 Lighthouse Performance"
    
    if ! check_command lhci; then
        log_warning "Lighthouse CI not installed. Install with: npm install -g @lhci/cli"
        record_result "Lighthouse" "SKIP" "Not installed"
        return
    fi
    
    cd "$FRONTEND_DIR"
    
    if lhci autorun --config="$QA_DIR/performance/lighthouse.config.js" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Lighthouse tests passed"
        record_result "Lighthouse" "PASS" "Performance OK"
    else
        log_warning "Lighthouse found issues"
        record_result "Lighthouse" "WARN" "Issues found"
    fi
}

run_k6() {
    print_section "📈 Load Testing (k6)"
    
    if ! check_command k6; then
        log_warning "k6 not installed. Install from: https://k6.io/"
        record_result "k6" "SKIP" "Not installed"
        return
    fi
    
    # Check if API is running
    if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
        log_warning "API not running. Skipping k6 tests."
        record_result "k6" "SKIP" "API not running"
        return
    fi
    
    if k6 run "$QA_DIR/performance/k6-load-test.js" --out json="$REPORTS_DIR/performance/k6-$TIMESTAMP.json" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "k6 load tests completed"
        record_result "k6" "PASS" "Load test complete"
    else
        log_warning "k6 tests had issues"
        record_result "k6" "WARN" "Issues detected"
    fi
}

generate_report() {
    print_section "📊 Generating Report"
    
    cd "$QA_DIR"
    
    if python reports/generate-report.py --reports-dir "$REPORTS_DIR" --output "$REPORTS_DIR/qa-report-$TIMESTAMP.json" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Report generated: qa-report-$TIMESTAMP.json"
        
        # Copy dashboard with report
        cp reports/dashboard.html "$REPORTS_DIR/dashboard-$TIMESTAMP.html"
        ln -sf "qa-report-$TIMESTAMP.json" "$REPORTS_DIR/qa-report.json"
        ln -sf "dashboard-$TIMESTAMP.html" "$REPORTS_DIR/dashboard.html"
    else
        log_warning "Report generation had issues"
    fi
}

print_summary() {
    print_section "📋 QA Summary"
    
    echo ""
    echo -e "  ${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
    
    for key in "${!RESULTS[@]}"; do
        IFS='|' read -r status message <<< "${RESULTS[$key]}"
        
        case $status in
            "PASS") icon="${GREEN}✓${NC}" ;;
            "WARN") icon="${YELLOW}!${NC}" ;;
            "FAIL") icon="${RED}✗${NC}" ;;
            "SKIP") icon="${BLUE}-${NC}" ;;
        esac
        
        printf "  ${PURPLE}║${NC}  $icon %-20s %-30s ${PURPLE}║${NC}\n" "$key" "$message"
    done
    
    echo -e "  ${PURPLE}╠════════════════════════════════════════════════════════╣${NC}"
    
    case $OVERALL_STATUS in
        "PASS") 
            echo -e "  ${PURPLE}║${NC}  ${GREEN}Overall: PASSED${NC}                                       ${PURPLE}║${NC}"
            ;;
        "WARN")
            echo -e "  ${PURPLE}║${NC}  ${YELLOW}Overall: WARNINGS${NC}                                     ${PURPLE}║${NC}"
            ;;
        "FAIL")
            echo -e "  ${PURPLE}║${NC}  ${RED}Overall: FAILED${NC}                                        ${PURPLE}║${NC}"
            ;;
    esac
    
    echo -e "  ${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BLUE}📁 Reports:${NC} $REPORTS_DIR"
    echo -e "  ${BLUE}📊 Dashboard:${NC} $REPORTS_DIR/dashboard.html"
    echo -e "  ${BLUE}📝 Log:${NC} $LOG_FILE"
    echo ""
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    # Parse arguments
    RUN_QUICK=false
    RUN_SECURITY_ONLY=false
    RUN_TESTS_ONLY=false
    RUN_PERFORMANCE=true
    
    for arg in "$@"; do
        case $arg in
            --quick)
                RUN_QUICK=true
                RUN_PERFORMANCE=false
                ;;
            --security)
                RUN_SECURITY_ONLY=true
                ;;
            --tests)
                RUN_TESTS_ONLY=true
                ;;
            --no-performance)
                RUN_PERFORMANCE=false
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --quick          Run quick checks only (no performance tests)"
                echo "  --security       Run security checks only"
                echo "  --tests          Run tests only"
                echo "  --no-performance Skip performance tests"
                echo "  --help           Show this help"
                exit 0
                ;;
        esac
    done
    
    # Setup
    mkdir -p "$REPORTS_DIR/security"
    mkdir -p "$REPORTS_DIR/performance"
    
    print_banner
    
    START_TIME=$(date +%s)
    log_info "Starting QA run at $(date)"
    log_info "Log file: $LOG_FILE"
    
    if [ "$RUN_SECURITY_ONLY" = true ]; then
        run_security_scan
    elif [ "$RUN_TESTS_ONLY" = true ]; then
        run_backend_tests
        run_e2e_tests
    else
        # Full run
        run_eslint
        run_typescript_check
        run_pylint
        run_security_scan
        run_backend_tests
        run_e2e_tests
        
        if [ "$RUN_PERFORMANCE" = true ]; then
            run_lighthouse
            run_k6
        fi
    fi
    
    generate_report
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    print_summary
    
    log_info "QA run completed in ${DURATION}s"
    
    # Exit code based on status
    case $OVERALL_STATUS in
        "PASS") exit 0 ;;
        "WARN") exit 0 ;;  # Warnings don't fail the pipeline
        "FAIL") exit 1 ;;
    esac
}

main "$@"


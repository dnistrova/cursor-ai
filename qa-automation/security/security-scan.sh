#!/bin/bash
# =============================================================================
# SECURITY SCANNING SCRIPT
# =============================================================================
# Comprehensive security scanning including:
# - Dependency vulnerability scanning (npm audit, pip-audit, Snyk)
# - Static Application Security Testing (SAST)
# - OWASP ZAP Dynamic Application Security Testing (DAST)
# - Secret detection (TruffleHog, git-secrets)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
REPORTS_DIR="$SCRIPT_DIR/../reports/security"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Timestamp for reports
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Security Scanning Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_warning "$1 is not installed. Skipping..."
        return 1
    fi
    return 0
}

# =============================================================================
# 1. DEPENDENCY VULNERABILITY SCANNING
# =============================================================================

echo -e "\n${BLUE}1. Dependency Vulnerability Scanning${NC}"
echo "--------------------------------------"

# NPM Audit (Frontend)
log_info "Running npm audit on frontend..."
if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    npm audit --json > "$REPORTS_DIR/npm-audit-$TIMESTAMP.json" 2>&1 || true
    
    # Summary
    HIGH=$(grep -c '"severity": "high"' "$REPORTS_DIR/npm-audit-$TIMESTAMP.json" || echo "0")
    CRITICAL=$(grep -c '"severity": "critical"' "$REPORTS_DIR/npm-audit-$TIMESTAMP.json" || echo "0")
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        log_warning "npm audit: $CRITICAL critical, $HIGH high vulnerabilities found"
    else
        log_success "npm audit: No critical/high vulnerabilities"
    fi
fi

# Pip Audit (Backend)
log_info "Running pip-audit on backend..."
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    if check_command pip-audit; then
        pip-audit -r requirements.txt --format json > "$REPORTS_DIR/pip-audit-$TIMESTAMP.json" 2>&1 || true
        
        VULNS=$(grep -c '"id"' "$REPORTS_DIR/pip-audit-$TIMESTAMP.json" || echo "0")
        if [ "$VULNS" -gt 0 ]; then
            log_warning "pip-audit: $VULNS vulnerabilities found"
        else
            log_success "pip-audit: No vulnerabilities found"
        fi
    fi
fi

# Snyk (if available)
log_info "Running Snyk vulnerability scan..."
if check_command snyk; then
    cd "$FRONTEND_DIR"
    snyk test --json > "$REPORTS_DIR/snyk-frontend-$TIMESTAMP.json" 2>&1 || true
    
    cd "$BACKEND_DIR"
    snyk test --json > "$REPORTS_DIR/snyk-backend-$TIMESTAMP.json" 2>&1 || true
    
    log_success "Snyk scans completed"
else
    log_warning "Snyk not installed. Install with: npm install -g snyk"
fi

# =============================================================================
# 2. SECRET DETECTION
# =============================================================================

echo -e "\n${BLUE}2. Secret Detection${NC}"
echo "--------------------"

cd "$PROJECT_ROOT"

# TruffleHog
log_info "Running TruffleHog for secret detection..."
if check_command trufflehog; then
    trufflehog filesystem "$PROJECT_ROOT" \
        --exclude-paths="$SCRIPT_DIR/.trufflehog-ignore" \
        --json > "$REPORTS_DIR/trufflehog-$TIMESTAMP.json" 2>&1 || true
    
    SECRETS=$(wc -l < "$REPORTS_DIR/trufflehog-$TIMESTAMP.json" || echo "0")
    if [ "$SECRETS" -gt 0 ]; then
        log_warning "TruffleHog: Potential secrets detected. Review report."
    else
        log_success "TruffleHog: No secrets detected"
    fi
fi

# Git Secrets
log_info "Scanning for common secret patterns..."
SECRETS_FOUND=0

# AWS Keys
if grep -rE "AKIA[0-9A-Z]{16}" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" "$PROJECT_ROOT" 2>/dev/null | grep -v node_modules | grep -v venv; then
    log_warning "Possible AWS access key detected!"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
fi

# Private Keys
if grep -rE "-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----" "$PROJECT_ROOT" 2>/dev/null | grep -v node_modules | grep -v venv; then
    log_warning "Private key detected!"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
fi

# Generic secrets
if grep -rE "(password|secret|api_key|apikey|access_token)\s*=\s*['\"][^'\"]+['\"]" --include="*.py" "$PROJECT_ROOT" 2>/dev/null | grep -v node_modules | grep -v venv | grep -v "example\|test\|placeholder"; then
    log_warning "Possible hardcoded credentials detected!"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
fi

if [ "$SECRETS_FOUND" -eq 0 ]; then
    log_success "No common secret patterns detected"
fi

# =============================================================================
# 3. STATIC APPLICATION SECURITY TESTING (SAST)
# =============================================================================

echo -e "\n${BLUE}3. Static Application Security Testing (SAST)${NC}"
echo "----------------------------------------------"

# Bandit (Python SAST)
log_info "Running Bandit on Python code..."
if check_command bandit; then
    cd "$BACKEND_DIR"
    bandit -r app/ -f json -o "$REPORTS_DIR/bandit-$TIMESTAMP.json" 2>&1 || true
    
    HIGH=$(grep -c '"severity": "HIGH"' "$REPORTS_DIR/bandit-$TIMESTAMP.json" || echo "0")
    MEDIUM=$(grep -c '"severity": "MEDIUM"' "$REPORTS_DIR/bandit-$TIMESTAMP.json" || echo "0")
    
    log_info "Bandit: $HIGH high, $MEDIUM medium severity issues"
else
    log_warning "Bandit not installed. Install with: pip install bandit"
fi

# Semgrep (Multi-language SAST)
log_info "Running Semgrep security rules..."
if check_command semgrep; then
    cd "$PROJECT_ROOT"
    semgrep --config "p/security-audit" \
            --config "p/owasp-top-ten" \
            --json \
            --output "$REPORTS_DIR/semgrep-$TIMESTAMP.json" \
            "$FRONTEND_DIR/src" "$BACKEND_DIR/app" 2>&1 || true
    
    log_success "Semgrep scan completed"
else
    log_warning "Semgrep not installed. Install with: pip install semgrep"
fi

# =============================================================================
# 4. OWASP ZAP (DAST) - Optional
# =============================================================================

echo -e "\n${BLUE}4. Dynamic Application Security Testing (DAST)${NC}"
echo "-----------------------------------------------"

if check_command zap.sh || check_command docker; then
    log_info "OWASP ZAP scan available..."
    log_info "To run ZAP scan:"
    echo "  docker run -t owasp/zap2docker-stable zap-api-scan.py \\"
    echo "    -t http://localhost:5000/api/v1/swagger.json \\"
    echo "    -f openapi -r zap-report.html"
else
    log_warning "OWASP ZAP not available. Install Docker to run ZAP."
fi

# =============================================================================
# 5. SECURITY HEADERS CHECK
# =============================================================================

echo -e "\n${BLUE}5. Security Headers Check${NC}"
echo "--------------------------"

check_security_headers() {
    local url=$1
    log_info "Checking security headers for $url..."
    
    if check_command curl; then
        headers=$(curl -sI "$url" 2>/dev/null)
        
        # Check for important security headers
        MISSING_HEADERS=""
        
        if ! echo "$headers" | grep -qi "X-Content-Type-Options"; then
            MISSING_HEADERS="$MISSING_HEADERS X-Content-Type-Options"
        fi
        if ! echo "$headers" | grep -qi "X-Frame-Options"; then
            MISSING_HEADERS="$MISSING_HEADERS X-Frame-Options"
        fi
        if ! echo "$headers" | grep -qi "X-XSS-Protection"; then
            MISSING_HEADERS="$MISSING_HEADERS X-XSS-Protection"
        fi
        if ! echo "$headers" | grep -qi "Content-Security-Policy"; then
            MISSING_HEADERS="$MISSING_HEADERS Content-Security-Policy"
        fi
        if ! echo "$headers" | grep -qi "Strict-Transport-Security"; then
            MISSING_HEADERS="$MISSING_HEADERS HSTS"
        fi
        
        if [ -n "$MISSING_HEADERS" ]; then
            log_warning "Missing security headers:$MISSING_HEADERS"
        else
            log_success "All important security headers present"
        fi
    fi
}

# Check if servers are running
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    check_security_headers "http://localhost:5000"
else
    log_warning "Backend not running. Start server to check security headers."
fi

# =============================================================================
# SUMMARY REPORT
# =============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Security Scan Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Reports generated in: $REPORTS_DIR"
echo ""
echo "Report files:"
ls -la "$REPORTS_DIR"/*-$TIMESTAMP.* 2>/dev/null || echo "No reports generated"
echo ""

# Generate consolidated report
cat > "$REPORTS_DIR/security-summary-$TIMESTAMP.md" << EOF
# Security Scan Summary

**Date:** $(date)
**Project:** cursor-ai

## Scan Results

### Dependency Vulnerabilities
- NPM Audit: See npm-audit-$TIMESTAMP.json
- Pip Audit: See pip-audit-$TIMESTAMP.json
- Snyk: See snyk-*-$TIMESTAMP.json

### Secret Detection
- TruffleHog: See trufflehog-$TIMESTAMP.json

### SAST Results
- Bandit: See bandit-$TIMESTAMP.json
- Semgrep: See semgrep-$TIMESTAMP.json

## Recommendations
1. Review all high/critical vulnerabilities
2. Update vulnerable dependencies
3. Remove any detected secrets and rotate credentials
4. Address SAST findings based on severity

## Next Steps
- [ ] Fix critical vulnerabilities
- [ ] Rotate exposed credentials
- [ ] Update security headers
- [ ] Run OWASP ZAP for DAST
EOF

log_success "Security scan complete! Review reports in $REPORTS_DIR"


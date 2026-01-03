#!/usr/bin/env python3
"""
QA Report Generator
====================
Generates comprehensive QA reports from various tool outputs.
Includes test results, code quality, security, and performance metrics.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import glob


class Status(Enum):
    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"
    SKIP = "skip"


@dataclass
class Metric:
    name: str
    value: Any
    threshold: Optional[Any] = None
    unit: str = ""
    status: Status = Status.PASS
    
    def to_dict(self):
        return {
            "name": self.name,
            "value": self.value,
            "threshold": self.threshold,
            "unit": self.unit,
            "status": self.status.value
        }


@dataclass
class CategoryReport:
    name: str
    status: Status
    metrics: List[Metric]
    summary: str = ""
    
    def to_dict(self):
        return {
            "name": self.name,
            "status": self.status.value,
            "summary": self.summary,
            "metrics": [m.to_dict() for m in self.metrics]
        }


class QAReportGenerator:
    """Generates comprehensive QA reports."""
    
    def __init__(self, reports_dir: str = None):
        self.reports_dir = Path(reports_dir or os.path.dirname(__file__))
        self.timestamp = datetime.now().isoformat()
        self.categories: Dict[str, CategoryReport] = {}
        
    def load_json_file(self, filepath: str) -> Optional[Dict]:
        """Load JSON file safely."""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Warning: Could not load {filepath}: {e}")
            return None
    
    def find_latest_report(self, pattern: str) -> Optional[str]:
        """Find the most recent report matching pattern."""
        files = glob.glob(str(self.reports_dir / pattern))
        if not files:
            return None
        return max(files, key=os.path.getctime)
    
    # =========================================================================
    # TEST RESULTS PARSING
    # =========================================================================
    
    def parse_pytest_results(self) -> CategoryReport:
        """Parse pytest results."""
        metrics = []
        
        # Look for pytest JSON report
        report_file = self.find_latest_report("pytest-*.json")
        if not report_file:
            report_file = self.reports_dir / "pytest-report.json"
        
        data = self.load_json_file(str(report_file))
        
        if data:
            summary = data.get("summary", {})
            passed = summary.get("passed", 0)
            failed = summary.get("failed", 0)
            skipped = summary.get("skipped", 0)
            total = summary.get("total", passed + failed + skipped)
            
            pass_rate = (passed / total * 100) if total > 0 else 0
            
            metrics = [
                Metric("Total Tests", total, unit="tests"),
                Metric("Passed", passed, unit="tests", status=Status.PASS),
                Metric("Failed", failed, unit="tests", 
                       status=Status.FAIL if failed > 0 else Status.PASS),
                Metric("Skipped", skipped, unit="tests"),
                Metric("Pass Rate", f"{pass_rate:.1f}", threshold=80, unit="%",
                       status=Status.PASS if pass_rate >= 80 else Status.WARN),
                Metric("Duration", data.get("duration", 0), unit="s"),
            ]
            
            status = Status.PASS if failed == 0 else Status.FAIL
            summary_text = f"{passed}/{total} tests passed ({pass_rate:.1f}%)"
        else:
            status = Status.SKIP
            summary_text = "No pytest results found"
        
        return CategoryReport(
            name="Backend Tests (pytest)",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    def parse_playwright_results(self) -> CategoryReport:
        """Parse Playwright test results."""
        metrics = []
        
        report_file = self.reports_dir.parent / "frontend" / "playwright-report" / "results.json"
        if not report_file.exists():
            report_file = self.find_latest_report("playwright-*.json")
        
        data = self.load_json_file(str(report_file)) if report_file else None
        
        if data:
            stats = data.get("stats", {})
            passed = stats.get("expected", 0)
            failed = stats.get("unexpected", 0)
            skipped = stats.get("skipped", 0)
            total = passed + failed + skipped
            
            pass_rate = (passed / total * 100) if total > 0 else 0
            
            metrics = [
                Metric("Total Tests", total, unit="tests"),
                Metric("Passed", passed, unit="tests"),
                Metric("Failed", failed, unit="tests",
                       status=Status.FAIL if failed > 0 else Status.PASS),
                Metric("Pass Rate", f"{pass_rate:.1f}", threshold=95, unit="%",
                       status=Status.PASS if pass_rate >= 95 else Status.WARN),
            ]
            
            status = Status.PASS if failed == 0 else Status.FAIL
            summary_text = f"{passed}/{total} E2E tests passed"
        else:
            status = Status.SKIP
            summary_text = "No Playwright results found"
            
        return CategoryReport(
            name="E2E Tests (Playwright)",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    # =========================================================================
    # CODE QUALITY PARSING
    # =========================================================================
    
    def parse_eslint_results(self) -> CategoryReport:
        """Parse ESLint results."""
        metrics = []
        
        report_file = self.find_latest_report("eslint-*.json")
        data = self.load_json_file(str(report_file)) if report_file else None
        
        if data and isinstance(data, list):
            total_errors = sum(r.get("errorCount", 0) for r in data)
            total_warnings = sum(r.get("warningCount", 0) for r in data)
            files_with_issues = sum(1 for r in data if r.get("errorCount", 0) > 0 or r.get("warningCount", 0) > 0)
            
            metrics = [
                Metric("Errors", total_errors, threshold=0,
                       status=Status.FAIL if total_errors > 0 else Status.PASS),
                Metric("Warnings", total_warnings,
                       status=Status.WARN if total_warnings > 10 else Status.PASS),
                Metric("Files with Issues", files_with_issues, unit="files"),
            ]
            
            status = Status.FAIL if total_errors > 0 else (Status.WARN if total_warnings > 10 else Status.PASS)
            summary_text = f"{total_errors} errors, {total_warnings} warnings"
        else:
            status = Status.SKIP
            summary_text = "No ESLint results found"
            
        return CategoryReport(
            name="ESLint (Frontend)",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    def parse_pylint_results(self) -> CategoryReport:
        """Parse Pylint results."""
        metrics = []
        
        report_file = self.find_latest_report("pylint-*.json")
        data = self.load_json_file(str(report_file)) if report_file else None
        
        if data:
            score = data.get("score", 0)
            messages = data.get("messages", [])
            
            error_count = sum(1 for m in messages if m.get("type") == "error")
            warning_count = sum(1 for m in messages if m.get("type") == "warning")
            convention_count = sum(1 for m in messages if m.get("type") == "convention")
            
            metrics = [
                Metric("Score", f"{score:.1f}", threshold=8.0, unit="/10",
                       status=Status.PASS if score >= 8.0 else Status.WARN),
                Metric("Errors", error_count, threshold=0,
                       status=Status.FAIL if error_count > 0 else Status.PASS),
                Metric("Warnings", warning_count),
                Metric("Conventions", convention_count),
            ]
            
            status = Status.PASS if score >= 8.0 and error_count == 0 else Status.WARN
            summary_text = f"Score: {score:.1f}/10"
        else:
            status = Status.SKIP
            summary_text = "No Pylint results found"
            
        return CategoryReport(
            name="Pylint (Backend)",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    # =========================================================================
    # SECURITY PARSING
    # =========================================================================
    
    def parse_security_results(self) -> CategoryReport:
        """Parse security scanning results."""
        metrics = []
        critical = 0
        high = 0
        medium = 0
        low = 0
        
        # NPM Audit
        npm_report = self.find_latest_report("security/npm-audit-*.json")
        if npm_report:
            data = self.load_json_file(npm_report)
            if data and "vulnerabilities" in data:
                vulns = data["vulnerabilities"]
                if isinstance(vulns, dict):
                    for v in vulns.values():
                        sev = v.get("severity", "").lower()
                        if sev == "critical":
                            critical += 1
                        elif sev == "high":
                            high += 1
                        elif sev == "medium":
                            medium += 1
                        elif sev == "low":
                            low += 1
        
        # Pip Audit
        pip_report = self.find_latest_report("security/pip-audit-*.json")
        if pip_report:
            data = self.load_json_file(pip_report)
            if data and isinstance(data, list):
                for v in data:
                    # Pip audit doesn't always have severity, count as medium
                    medium += 1
        
        # Bandit
        bandit_report = self.find_latest_report("security/bandit-*.json")
        if bandit_report:
            data = self.load_json_file(bandit_report)
            if data and "results" in data:
                for r in data["results"]:
                    sev = r.get("issue_severity", "").upper()
                    if sev == "HIGH":
                        high += 1
                    elif sev == "MEDIUM":
                        medium += 1
                    elif sev == "LOW":
                        low += 1
        
        metrics = [
            Metric("Critical", critical, threshold=0,
                   status=Status.FAIL if critical > 0 else Status.PASS),
            Metric("High", high, threshold=0,
                   status=Status.FAIL if high > 0 else Status.PASS),
            Metric("Medium", medium,
                   status=Status.WARN if medium > 5 else Status.PASS),
            Metric("Low", low),
        ]
        
        if critical > 0 or high > 0:
            status = Status.FAIL
        elif medium > 5:
            status = Status.WARN
        else:
            status = Status.PASS
            
        summary_text = f"{critical} critical, {high} high, {medium} medium, {low} low"
        
        return CategoryReport(
            name="Security",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    # =========================================================================
    # PERFORMANCE PARSING
    # =========================================================================
    
    def parse_performance_results(self) -> CategoryReport:
        """Parse performance test results."""
        metrics = []
        
        # Lighthouse
        lh_report = self.find_latest_report("performance/lighthouse-*.json")
        if lh_report:
            data = self.load_json_file(lh_report)
            if data and "categories" in data:
                perf = data["categories"].get("performance", {}).get("score", 0) * 100
                a11y = data["categories"].get("accessibility", {}).get("score", 0) * 100
                bp = data["categories"].get("best-practices", {}).get("score", 0) * 100
                seo = data["categories"].get("seo", {}).get("score", 0) * 100
                
                metrics.extend([
                    Metric("Performance", f"{perf:.0f}", threshold=80, unit="%",
                           status=Status.PASS if perf >= 80 else Status.WARN),
                    Metric("Accessibility", f"{a11y:.0f}", threshold=90, unit="%",
                           status=Status.PASS if a11y >= 90 else Status.WARN),
                    Metric("Best Practices", f"{bp:.0f}", threshold=80, unit="%"),
                    Metric("SEO", f"{seo:.0f}", threshold=80, unit="%"),
                ])
        
        # k6 Results
        k6_report = self.find_latest_report("performance/k6-summary.json")
        if k6_report:
            data = self.load_json_file(k6_report)
            if data and "metrics" in data:
                http_duration = data["metrics"].get("http_req_duration", {})
                if http_duration:
                    p95 = http_duration.get("values", {}).get("p(95)", 0)
                    metrics.append(
                        Metric("API p95 Response", f"{p95:.0f}", threshold=500, unit="ms",
                               status=Status.PASS if p95 < 500 else Status.WARN)
                    )
                
                errors = data["metrics"].get("errors", {})
                if errors:
                    error_rate = errors.get("values", {}).get("rate", 0) * 100
                    metrics.append(
                        Metric("Error Rate", f"{error_rate:.2f}", threshold=1, unit="%",
                               status=Status.PASS if error_rate < 1 else Status.FAIL)
                    )
        
        if metrics:
            # Determine overall status
            has_fail = any(m.status == Status.FAIL for m in metrics)
            has_warn = any(m.status == Status.WARN for m in metrics)
            status = Status.FAIL if has_fail else (Status.WARN if has_warn else Status.PASS)
            summary_text = "Performance metrics collected"
        else:
            status = Status.SKIP
            summary_text = "No performance results found"
        
        return CategoryReport(
            name="Performance",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    # =========================================================================
    # COVERAGE PARSING
    # =========================================================================
    
    def parse_coverage_results(self) -> CategoryReport:
        """Parse code coverage results."""
        metrics = []
        
        # Backend coverage (coverage.xml or .coverage)
        coverage_file = self.reports_dir.parent / "backend" / "coverage.xml"
        # Parse XML if exists...
        
        # For now, use placeholder
        coverage_pct = 0
        
        metrics = [
            Metric("Line Coverage", f"{coverage_pct:.1f}", threshold=80, unit="%",
                   status=Status.PASS if coverage_pct >= 80 else Status.WARN),
        ]
        
        status = Status.PASS if coverage_pct >= 80 else Status.WARN
        summary_text = f"{coverage_pct:.1f}% coverage"
        
        return CategoryReport(
            name="Code Coverage",
            status=status,
            metrics=metrics,
            summary=summary_text
        )
    
    # =========================================================================
    # REPORT GENERATION
    # =========================================================================
    
    def generate_report(self) -> Dict:
        """Generate the complete QA report."""
        self.categories = {
            "backend_tests": self.parse_pytest_results(),
            "e2e_tests": self.parse_playwright_results(),
            "eslint": self.parse_eslint_results(),
            "pylint": self.parse_pylint_results(),
            "security": self.parse_security_results(),
            "performance": self.parse_performance_results(),
            "coverage": self.parse_coverage_results(),
        }
        
        # Calculate overall status
        statuses = [c.status for c in self.categories.values()]
        if any(s == Status.FAIL for s in statuses):
            overall_status = Status.FAIL
        elif any(s == Status.WARN for s in statuses):
            overall_status = Status.WARN
        else:
            overall_status = Status.PASS
        
        return {
            "timestamp": self.timestamp,
            "overall_status": overall_status.value,
            "categories": {k: v.to_dict() for k, v in self.categories.items()},
            "summary": {
                "total_categories": len(self.categories),
                "passed": sum(1 for c in self.categories.values() if c.status == Status.PASS),
                "warned": sum(1 for c in self.categories.values() if c.status == Status.WARN),
                "failed": sum(1 for c in self.categories.values() if c.status == Status.FAIL),
                "skipped": sum(1 for c in self.categories.values() if c.status == Status.SKIP),
            }
        }
    
    def save_report(self, output_path: str = None) -> str:
        """Save report to JSON file."""
        report = self.generate_report()
        output_path = output_path or str(self.reports_dir / f"qa-report-{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        return output_path


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate QA Report")
    parser.add_argument("--reports-dir", default=None, help="Reports directory")
    parser.add_argument("--output", default=None, help="Output file path")
    parser.add_argument("--format", choices=["json", "html"], default="json", help="Output format")
    
    args = parser.parse_args()
    
    generator = QAReportGenerator(args.reports_dir)
    output_path = generator.save_report(args.output)
    
    print(f"✅ Report generated: {output_path}")
    
    # Print summary
    report = generator.generate_report()
    print(f"\n📊 QA Report Summary")
    print(f"{'='*40}")
    print(f"Status: {report['overall_status'].upper()}")
    print(f"Categories: {report['summary']['passed']} passed, {report['summary']['warned']} warnings, {report['summary']['failed']} failed")
    
    return 0 if report['overall_status'] != 'fail' else 1


if __name__ == "__main__":
    sys.exit(main())


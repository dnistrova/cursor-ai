#!/usr/bin/env python3
"""
QA Results Analyzer
====================
Analyzes QA results and provides AI-generated improvement recommendations.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class Issue:
    category: str
    severity: str  # critical, high, medium, low, info
    title: str
    description: str
    recommendation: str
    file: Optional[str] = None
    line: Optional[int] = None


class QAAnalyzer:
    """Analyzes QA results and generates recommendations."""
    
    def __init__(self, reports_dir: str):
        self.reports_dir = Path(reports_dir)
        self.issues: List[Issue] = []
        self.metrics: Dict[str, Any] = {}
        
    def load_json(self, filepath: Path) -> Optional[Dict]:
        """Load JSON file safely."""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    def find_latest_report(self, pattern: str) -> Optional[Path]:
        """Find most recent report matching pattern."""
        files = list(self.reports_dir.glob(pattern))
        if not files:
            return None
        return max(files, key=lambda f: f.stat().st_mtime)
    
    # =========================================================================
    # ANALYSIS METHODS
    # =========================================================================
    
    def analyze_test_coverage(self) -> None:
        """Analyze test coverage and identify gaps."""
        # This would parse coverage.xml or similar
        coverage_file = self.reports_dir.parent / "backend" / "coverage.xml"
        
        if not coverage_file.exists():
            self.issues.append(Issue(
                category="Testing",
                severity="medium",
                title="Missing Coverage Report",
                description="No code coverage data available.",
                recommendation="Run tests with coverage: pytest --cov=app --cov-report=xml"
            ))
            return
        
        # Parse coverage and identify low-coverage files
        # For now, add placeholder recommendation
        self.issues.append(Issue(
            category="Testing",
            severity="info",
            title="Coverage Analysis",
            description="Review test coverage for critical paths.",
            recommendation="Focus on testing error handlers, edge cases, and security-critical code."
        ))
    
    def analyze_code_complexity(self) -> None:
        """Analyze code complexity from linting reports."""
        pylint_report = self.find_latest_report("pylint-*.json")
        
        if pylint_report:
            data = self.load_json(pylint_report)
            if data:
                for msg in data.get("messages", []):
                    if "complexity" in msg.get("message", "").lower():
                        self.issues.append(Issue(
                            category="Code Quality",
                            severity="medium",
                            title="High Complexity",
                            description=f"Complex code in {msg.get('module', 'unknown')}",
                            recommendation="Consider breaking down into smaller functions. Target cyclomatic complexity < 10.",
                            file=msg.get("path"),
                            line=msg.get("line")
                        ))
    
    def analyze_security(self) -> None:
        """Analyze security scanning results."""
        # NPM Audit
        npm_report = self.find_latest_report("security/npm-audit-*.json")
        if npm_report:
            data = self.load_json(npm_report)
            if data and "vulnerabilities" in data:
                for name, vuln in data["vulnerabilities"].items():
                    severity = vuln.get("severity", "unknown")
                    if severity in ["critical", "high"]:
                        self.issues.append(Issue(
                            category="Security",
                            severity=severity,
                            title=f"Vulnerable Package: {name}",
                            description=f"{severity.upper()} severity vulnerability in {name}",
                            recommendation=f"Run: npm audit fix --force, or manually update {name} to a patched version."
                        ))
        
        # Bandit
        bandit_report = self.find_latest_report("security/bandit-*.json")
        if bandit_report:
            data = self.load_json(bandit_report)
            if data and "results" in data:
                for result in data["results"]:
                    severity = result.get("issue_severity", "").lower()
                    if severity in ["high", "medium"]:
                        self.issues.append(Issue(
                            category="Security",
                            severity=severity,
                            title=result.get("issue_text", "Security Issue"),
                            description=f"Found in {result.get('filename', 'unknown')}",
                            recommendation=f"Review and fix: {result.get('issue_cwe', {}).get('link', 'See OWASP guidelines')}",
                            file=result.get("filename"),
                            line=result.get("line_number")
                        ))
    
    def analyze_performance(self) -> None:
        """Analyze performance test results."""
        # k6 results
        k6_report = self.find_latest_report("performance/k6-summary.json")
        if k6_report:
            data = self.load_json(k6_report)
            if data and "metrics" in data:
                http_duration = data["metrics"].get("http_req_duration", {})
                p95 = http_duration.get("values", {}).get("p(95)", 0)
                
                if p95 > 500:
                    self.issues.append(Issue(
                        category="Performance",
                        severity="high" if p95 > 1000 else "medium",
                        title="Slow API Response Time",
                        description=f"95th percentile response time is {p95:.0f}ms (target: <500ms)",
                        recommendation="Profile slow endpoints. Consider: database indexing, query optimization, caching, async processing."
                    ))
                
                error_rate = data["metrics"].get("errors", {}).get("values", {}).get("rate", 0)
                if error_rate > 0.01:
                    self.issues.append(Issue(
                        category="Performance",
                        severity="high",
                        title="High Error Rate Under Load",
                        description=f"Error rate is {error_rate*100:.2f}% (target: <1%)",
                        recommendation="Review error logs. Check for: connection limits, memory issues, timeout configurations."
                    ))
        
        # Lighthouse
        # Would parse Lighthouse JSON and add issues for failing audits
    
    def analyze_accessibility(self) -> None:
        """Analyze accessibility issues."""
        # Would parse Lighthouse or axe-core results
        self.issues.append(Issue(
            category="Accessibility",
            severity="info",
            title="Accessibility Review",
            description="Regular accessibility audits recommended.",
            recommendation="Run axe-core or Lighthouse accessibility audits. Target WCAG 2.1 AA compliance."
        ))
    
    def analyze_dependencies(self) -> None:
        """Analyze dependency health."""
        npm_report = self.find_latest_report("security/npm-audit-*.json")
        if npm_report:
            data = self.load_json(npm_report)
            if data:
                # Check for outdated dependencies
                # This would require running npm outdated and parsing results
                pass
    
    # =========================================================================
    # RECOMMENDATIONS ENGINE
    # =========================================================================
    
    def generate_recommendations(self) -> Dict[str, List[str]]:
        """Generate actionable recommendations based on issues."""
        recommendations = defaultdict(list)
        
        for issue in self.issues:
            if issue.severity in ["critical", "high"]:
                recommendations["Immediate Actions"].append(
                    f"[{issue.category}] {issue.title}: {issue.recommendation}"
                )
            elif issue.severity == "medium":
                recommendations["Short-term Improvements"].append(
                    f"[{issue.category}] {issue.title}: {issue.recommendation}"
                )
            else:
                recommendations["Long-term Enhancements"].append(
                    f"[{issue.category}] {issue.title}: {issue.recommendation}"
                )
        
        return dict(recommendations)
    
    def generate_summary(self) -> Dict:
        """Generate analysis summary."""
        severity_counts = defaultdict(int)
        category_counts = defaultdict(int)
        
        for issue in self.issues:
            severity_counts[issue.severity] += 1
            category_counts[issue.category] += 1
        
        return {
            "total_issues": len(self.issues),
            "by_severity": dict(severity_counts),
            "by_category": dict(category_counts),
            "critical_count": severity_counts.get("critical", 0),
            "high_count": severity_counts.get("high", 0),
        }
    
    # =========================================================================
    # MAIN ANALYSIS
    # =========================================================================
    
    def run_analysis(self) -> Dict:
        """Run complete analysis."""
        print("🔍 Analyzing QA results...")
        
        self.analyze_test_coverage()
        self.analyze_code_complexity()
        self.analyze_security()
        self.analyze_performance()
        self.analyze_accessibility()
        self.analyze_dependencies()
        
        summary = self.generate_summary()
        recommendations = self.generate_recommendations()
        
        return {
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "issues": [
                {
                    "category": i.category,
                    "severity": i.severity,
                    "title": i.title,
                    "description": i.description,
                    "recommendation": i.recommendation,
                    "file": i.file,
                    "line": i.line
                }
                for i in sorted(self.issues, key=lambda x: 
                    {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}[x.severity])
            ],
            "recommendations": recommendations
        }
    
    def print_report(self, analysis: Dict) -> None:
        """Print human-readable report."""
        print("\n" + "="*60)
        print("📊 QA ANALYSIS REPORT")
        print("="*60)
        
        summary = analysis["summary"]
        print(f"\n📈 Summary:")
        print(f"   Total Issues: {summary['total_issues']}")
        print(f"   Critical: {summary['critical_count']}")
        print(f"   High: {summary['high_count']}")
        
        if analysis["issues"]:
            print(f"\n🔍 Top Issues:")
            for issue in analysis["issues"][:10]:
                icon = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢", "info": "🔵"}
                print(f"   {icon.get(issue['severity'], '⚪')} [{issue['category']}] {issue['title']}")
        
        if analysis["recommendations"]:
            print(f"\n💡 Recommendations:")
            for priority, items in analysis["recommendations"].items():
                print(f"\n   {priority}:")
                for item in items[:5]:
                    print(f"   • {item}")
        
        print("\n" + "="*60)


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Analyze QA Results")
    parser.add_argument("--reports-dir", default="reports", help="Reports directory")
    parser.add_argument("--output", default=None, help="Output file (JSON)")
    parser.add_argument("--format", choices=["json", "text", "markdown"], default="text")
    
    args = parser.parse_args()
    
    analyzer = QAAnalyzer(args.reports_dir)
    analysis = analyzer.run_analysis()
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(analysis, f, indent=2)
        print(f"✅ Analysis saved to {args.output}")
    
    if args.format == "text":
        analyzer.print_report(analysis)
    elif args.format == "json":
        print(json.dumps(analysis, indent=2))
    elif args.format == "markdown":
        # Generate markdown report
        print("# QA Analysis Report\n")
        print(f"Generated: {analysis['timestamp']}\n")
        print("## Summary\n")
        print(f"- Total Issues: {analysis['summary']['total_issues']}")
        print(f"- Critical: {analysis['summary']['critical_count']}")
        print(f"- High: {analysis['summary']['high_count']}\n")
    
    # Exit with error if critical issues found
    if analysis["summary"]["critical_count"] > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())


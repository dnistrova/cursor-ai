"""
Dashboard Page Object
======================
Page Object for the main dashboard and analytics pages.
"""

from playwright.sync_api import Page, Locator
from .base_page import BasePage
from typing import List, Dict


class DashboardPage(BasePage):
    """Page Object for the Dashboard page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/(dashboard|$)"
    
    def _setup_locators(self):
        """Define dashboard page locators."""
        # Header
        self.page_title = self.page.get_by_role("heading", level=1)
        self.refresh_button = self.page.get_by_role("button", name="Refresh")
        self.date_range_picker = self.page.locator(".date-range-picker")
        
        # KPI Cards
        self.kpi_cards = self.page.locator("[data-testid='kpi-card']")
        self.total_tickets_card = self.page.locator("[data-testid='kpi-total-tickets']")
        self.open_tickets_card = self.page.locator("[data-testid='kpi-open-tickets']")
        self.resolved_today_card = self.page.locator("[data-testid='kpi-resolved-today']")
        self.avg_response_time_card = self.page.locator("[data-testid='kpi-avg-response']")
        
        # Charts
        self.ticket_trends_chart = self.page.locator("[data-testid='chart-ticket-trends']")
        self.priority_distribution_chart = self.page.locator("[data-testid='chart-priority']")
        self.category_breakdown_chart = self.page.locator("[data-testid='chart-category']")
        self.agent_performance_chart = self.page.locator("[data-testid='chart-agent-perf']")
        
        # Tables
        self.recent_tickets_table = self.page.locator("[data-testid='recent-tickets-table']")
        self.agent_leaderboard = self.page.locator("[data-testid='agent-leaderboard']")
        
        # Filters
        self.filter_dropdown = self.page.get_by_role("combobox", name="Filter")
        self.category_filter = self.page.get_by_role("combobox", name="Category")
        self.priority_filter = self.page.get_by_role("combobox", name="Priority")
        
        # Export
        self.export_button = self.page.get_by_role("button", name="Export")
        self.export_csv = self.page.get_by_role("menuitem", name="Export CSV")
        self.export_pdf = self.page.get_by_role("menuitem", name="Export PDF")
    
    # =========================================================================
    # NAVIGATION
    # =========================================================================
    
    def navigate_to_dashboard(self) -> None:
        """Navigate to the dashboard page."""
        self.navigate("dashboard")
    
    # =========================================================================
    # ACTIONS
    # =========================================================================
    
    def refresh_data(self) -> None:
        """Click refresh to reload dashboard data."""
        self.click(self.refresh_button)
        self.wait_for_page_load()
    
    def set_date_range(self, start_date: str, end_date: str) -> None:
        """Set the date range filter."""
        self.click(self.date_range_picker)
        # Implementation depends on date picker component
        pass
    
    def filter_by_category(self, category: str) -> None:
        """Filter dashboard by category."""
        self.select_option(self.category_filter, category)
        self.wait_for_page_load()
    
    def filter_by_priority(self, priority: str) -> None:
        """Filter dashboard by priority."""
        self.select_option(self.priority_filter, priority)
        self.wait_for_page_load()
    
    def export_as_csv(self) -> None:
        """Export dashboard data as CSV."""
        self.click(self.export_button)
        self.click(self.export_csv)
    
    def export_as_pdf(self) -> None:
        """Export dashboard data as PDF."""
        self.click(self.export_button)
        self.click(self.export_pdf)
    
    # =========================================================================
    # GETTERS
    # =========================================================================
    
    def get_kpi_value(self, kpi_name: str) -> str:
        """Get the value of a specific KPI card."""
        kpi_locator = self.page.locator(f"[data-testid='kpi-{kpi_name}'] .value")
        return self.get_text(kpi_locator)
    
    def get_total_tickets_count(self) -> int:
        """Get total tickets count from KPI card."""
        value = self.get_text(self.total_tickets_card.locator(".value"))
        return int(value.replace(",", ""))
    
    def get_open_tickets_count(self) -> int:
        """Get open tickets count from KPI card."""
        value = self.get_text(self.open_tickets_card.locator(".value"))
        return int(value.replace(",", ""))
    
    def get_recent_tickets(self) -> List[Dict]:
        """Get list of recent tickets from table."""
        rows = self.recent_tickets_table.locator("tbody tr")
        tickets = []
        for i in range(rows.count()):
            row = rows.nth(i)
            tickets.append({
                "id": self.get_text(row.locator("td").nth(0)),
                "title": self.get_text(row.locator("td").nth(1)),
                "status": self.get_text(row.locator("td").nth(2)),
                "priority": self.get_text(row.locator("td").nth(3)),
            })
        return tickets
    
    def get_chart_data(self, chart_name: str) -> Dict:
        """Get data from a specific chart (if exposed in DOM)."""
        chart_locator = self.page.locator(f"[data-testid='chart-{chart_name}']")
        # Chart data would typically be in a data attribute or accessible via JS
        return {}
    
    # =========================================================================
    # ASSERTIONS
    # =========================================================================
    
    def expect_dashboard_loaded(self) -> None:
        """Assert that dashboard has loaded with all components."""
        self.expect_visible(self.page_title)
        self.expect_visible(self.kpi_cards.first)
    
    def expect_kpi_cards_visible(self, count: int = 4) -> None:
        """Assert that expected number of KPI cards are visible."""
        self.expect_count(self.kpi_cards, count)
    
    def expect_charts_visible(self) -> None:
        """Assert that all charts are visible."""
        self.expect_visible(self.ticket_trends_chart)
        self.expect_visible(self.priority_distribution_chart)
    
    def expect_kpi_value(self, kpi_name: str, expected_value: str) -> None:
        """Assert that a KPI has expected value."""
        actual = self.get_kpi_value(kpi_name)
        assert actual == expected_value, f"KPI {kpi_name}: expected {expected_value}, got {actual}"
    
    def expect_positive_trend(self, kpi_name: str) -> None:
        """Assert that a KPI shows positive trend indicator."""
        kpi = self.page.locator(f"[data-testid='kpi-{kpi_name}']")
        trend = kpi.locator(".trend-indicator")
        assert "positive" in (trend.get_attribute("class") or "")


class AnalyticsPage(BasePage):
    """Page Object for detailed Analytics page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/analytics"
    
    def _setup_locators(self):
        """Define analytics page locators."""
        self.page_title = self.page.get_by_role("heading", level=1)
        self.time_period_tabs = self.page.locator(".time-period-tabs")
        self.metrics_grid = self.page.locator(".metrics-grid")
        self.detailed_charts = self.page.locator(".detailed-charts")
        self.data_table = self.page.locator("[data-testid='analytics-table']")
        self.download_report = self.page.get_by_role("button", name="Download Report")
    
    def navigate_to_analytics(self) -> None:
        """Navigate to analytics page."""
        self.navigate("analytics")
    
    def select_time_period(self, period: str) -> None:
        """Select time period (day, week, month, year)."""
        tab = self.time_period_tabs.get_by_role("tab", name=period)
        self.click(tab)
        self.wait_for_page_load()
    
    def download_report(self, format: str = "pdf") -> None:
        """Download analytics report."""
        self.click(self.download_report)


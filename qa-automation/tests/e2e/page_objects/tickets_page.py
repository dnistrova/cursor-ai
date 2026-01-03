"""
Tickets Page Object
====================
Page Object for ticket management pages (list, detail, create).
"""

from playwright.sync_api import Page, Locator
from .base_page import BasePage
from typing import List, Dict, Optional


class TicketsListPage(BasePage):
    """Page Object for the Tickets List page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/tickets$"
    
    def _setup_locators(self):
        """Define tickets list page locators."""
        # Header
        self.page_title = self.page.get_by_role("heading", level=1)
        self.create_ticket_button = self.page.get_by_role("button", name="Create Ticket")
        
        # Search and filters
        self.search_input = self.page.get_by_placeholder("Search tickets")
        self.status_filter = self.page.get_by_role("combobox", name="Status")
        self.priority_filter = self.page.get_by_role("combobox", name="Priority")
        self.assignee_filter = self.page.get_by_role("combobox", name="Assignee")
        self.category_filter = self.page.get_by_role("combobox", name="Category")
        self.clear_filters_button = self.page.get_by_role("button", name="Clear filters")
        
        # Ticket list
        self.tickets_table = self.page.locator("[data-testid='tickets-table']")
        self.ticket_rows = self.page.locator("[data-testid='ticket-row']")
        self.empty_state = self.page.locator("[data-testid='empty-state']")
        self.loading_spinner = self.page.locator("[data-testid='loading']")
        
        # Pagination
        self.pagination = self.page.locator(".pagination")
        self.prev_page_button = self.page.get_by_role("button", name="Previous")
        self.next_page_button = self.page.get_by_role("button", name="Next")
        self.page_info = self.page.locator(".page-info")
        
        # Bulk actions
        self.select_all_checkbox = self.page.get_by_label("Select all")
        self.bulk_actions_dropdown = self.page.get_by_role("button", name="Bulk actions")
    
    # =========================================================================
    # NAVIGATION
    # =========================================================================
    
    def navigate_to_tickets(self) -> None:
        """Navigate to tickets list page."""
        self.navigate("tickets")
    
    def click_create_ticket(self) -> None:
        """Click create ticket button."""
        self.click(self.create_ticket_button)
    
    def open_ticket(self, ticket_number: str) -> None:
        """Open a ticket by its ticket number."""
        ticket_link = self.page.get_by_role("link", name=ticket_number)
        self.click(ticket_link)
    
    def open_ticket_by_index(self, index: int) -> None:
        """Open a ticket by its row index (0-based)."""
        row = self.ticket_rows.nth(index)
        self.click(row.locator("a").first)
    
    # =========================================================================
    # SEARCH AND FILTER
    # =========================================================================
    
    def search(self, query: str) -> None:
        """Search for tickets."""
        self.fill(self.search_input, query)
        self.press_key("Enter")
        self.wait_for_page_load()
    
    def filter_by_status(self, status: str) -> None:
        """Filter by status."""
        self.select_option(self.status_filter, status)
        self.wait_for_page_load()
    
    def filter_by_priority(self, priority: str) -> None:
        """Filter by priority."""
        self.select_option(self.priority_filter, priority)
        self.wait_for_page_load()
    
    def filter_by_assignee(self, assignee: str) -> None:
        """Filter by assignee."""
        self.select_option(self.assignee_filter, assignee)
        self.wait_for_page_load()
    
    def filter_by_category(self, category: str) -> None:
        """Filter by category."""
        self.select_option(self.category_filter, category)
        self.wait_for_page_load()
    
    def clear_all_filters(self) -> None:
        """Clear all applied filters."""
        self.click(self.clear_filters_button)
        self.wait_for_page_load()
    
    # =========================================================================
    # PAGINATION
    # =========================================================================
    
    def go_to_next_page(self) -> None:
        """Go to next page of results."""
        self.click(self.next_page_button)
        self.wait_for_page_load()
    
    def go_to_previous_page(self) -> None:
        """Go to previous page of results."""
        self.click(self.prev_page_button)
        self.wait_for_page_load()
    
    def go_to_page(self, page_number: int) -> None:
        """Go to specific page number."""
        page_button = self.pagination.get_by_role("button", name=str(page_number))
        self.click(page_button)
        self.wait_for_page_load()
    
    # =========================================================================
    # BULK ACTIONS
    # =========================================================================
    
    def select_all_tickets(self) -> None:
        """Select all tickets on current page."""
        self.check(self.select_all_checkbox)
    
    def select_tickets(self, indices: List[int]) -> None:
        """Select specific tickets by index."""
        for index in indices:
            checkbox = self.ticket_rows.nth(index).get_by_role("checkbox")
            self.check(checkbox)
    
    def bulk_close_selected(self) -> None:
        """Close all selected tickets."""
        self.click(self.bulk_actions_dropdown)
        self.click(self.page.get_by_role("menuitem", name="Close tickets"))
    
    def bulk_assign_selected(self, assignee: str) -> None:
        """Assign selected tickets to user."""
        self.click(self.bulk_actions_dropdown)
        self.click(self.page.get_by_role("menuitem", name="Assign to"))
        self.select_option(self.page.get_by_label("Select assignee"), assignee)
    
    # =========================================================================
    # GETTERS
    # =========================================================================
    
    def get_ticket_count(self) -> int:
        """Get number of tickets on current page."""
        return self.ticket_rows.count()
    
    def get_tickets(self) -> List[Dict]:
        """Get all tickets on current page."""
        tickets = []
        for i in range(self.ticket_rows.count()):
            row = self.ticket_rows.nth(i)
            tickets.append({
                "number": self.get_text(row.locator(".ticket-number")),
                "title": self.get_text(row.locator(".ticket-title")),
                "status": self.get_text(row.locator(".ticket-status")),
                "priority": self.get_text(row.locator(".ticket-priority")),
                "assignee": self.get_text(row.locator(".ticket-assignee")),
            })
        return tickets
    
    def get_page_info(self) -> str:
        """Get pagination info (e.g., '1-20 of 100')."""
        return self.get_text(self.page_info)
    
    # =========================================================================
    # ASSERTIONS
    # =========================================================================
    
    def expect_tickets_loaded(self) -> None:
        """Assert that tickets have loaded."""
        self.wait_for_hidden(self.loading_spinner)
        # Either tickets exist or empty state is shown
        assert self.ticket_rows.count() > 0 or self.is_visible(self.empty_state)
    
    def expect_ticket_count(self, count: int) -> None:
        """Assert number of tickets on page."""
        self.expect_count(self.ticket_rows, count)
    
    def expect_empty_state(self) -> None:
        """Assert that empty state is shown."""
        self.expect_visible(self.empty_state)
    
    def expect_ticket_in_list(self, ticket_number: str) -> None:
        """Assert that a specific ticket is in the list."""
        ticket = self.page.locator(f"text={ticket_number}")
        self.expect_visible(ticket)


class TicketDetailPage(BasePage):
    """Page Object for Ticket Detail page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/tickets/\d+"
    
    def _setup_locators(self):
        """Define ticket detail page locators."""
        # Header
        self.ticket_number = self.page.locator("[data-testid='ticket-number']")
        self.ticket_title = self.page.get_by_role("heading", level=1)
        self.status_badge = self.page.locator("[data-testid='status-badge']")
        self.priority_badge = self.page.locator("[data-testid='priority-badge']")
        
        # Actions
        self.edit_button = self.page.get_by_role("button", name="Edit")
        self.assign_button = self.page.get_by_role("button", name="Assign")
        self.status_dropdown = self.page.get_by_role("button", name="Change Status")
        self.close_button = self.page.get_by_role("button", name="Close Ticket")
        
        # Details
        self.description = self.page.locator("[data-testid='ticket-description']")
        self.created_at = self.page.locator("[data-testid='created-at']")
        self.updated_at = self.page.locator("[data-testid='updated-at']")
        self.category = self.page.locator("[data-testid='category']")
        self.assignee = self.page.locator("[data-testid='assignee']")
        self.reporter = self.page.locator("[data-testid='reporter']")
        
        # SLA
        self.sla_response_due = self.page.locator("[data-testid='sla-response']")
        self.sla_resolution_due = self.page.locator("[data-testid='sla-resolution']")
        self.sla_status = self.page.locator("[data-testid='sla-status']")
        
        # Comments
        self.comments_section = self.page.locator("[data-testid='comments-section']")
        self.comment_input = self.page.get_by_placeholder("Add a comment")
        self.submit_comment_button = self.page.get_by_role("button", name="Post Comment")
        self.comment_items = self.page.locator("[data-testid='comment-item']")
        self.internal_comment_toggle = self.page.get_by_label("Internal only")
        
        # History
        self.history_tab = self.page.get_by_role("tab", name="History")
        self.history_items = self.page.locator("[data-testid='history-item']")
        
        # Attachments
        self.attachments_section = self.page.locator("[data-testid='attachments']")
        self.upload_attachment_button = self.page.get_by_role("button", name="Upload")
        self.attachment_items = self.page.locator("[data-testid='attachment-item']")
    
    # =========================================================================
    # NAVIGATION
    # =========================================================================
    
    def navigate_to_ticket(self, ticket_id: int) -> None:
        """Navigate to specific ticket."""
        self.navigate(f"tickets/{ticket_id}")
    
    def go_back_to_list(self) -> None:
        """Go back to tickets list."""
        back_button = self.page.get_by_role("link", name="Back to tickets")
        self.click(back_button)
    
    # =========================================================================
    # ACTIONS
    # =========================================================================
    
    def change_status(self, new_status: str) -> None:
        """Change ticket status."""
        self.click(self.status_dropdown)
        status_option = self.page.get_by_role("menuitem", name=new_status)
        self.click(status_option)
    
    def assign_to(self, assignee: str) -> None:
        """Assign ticket to user."""
        self.click(self.assign_button)
        assignee_option = self.page.get_by_role("option", name=assignee)
        self.click(assignee_option)
    
    def add_comment(self, text: str, internal: bool = False) -> None:
        """Add a comment to the ticket."""
        self.fill(self.comment_input, text)
        if internal:
            self.check(self.internal_comment_toggle)
        self.click(self.submit_comment_button)
    
    def close_ticket(self, resolution: str = "") -> None:
        """Close the ticket."""
        self.click(self.close_button)
        if resolution:
            resolution_input = self.page.get_by_label("Resolution")
            self.fill(resolution_input, resolution)
        confirm = self.page.get_by_role("button", name="Confirm")
        self.click(confirm)
    
    def edit_ticket(self) -> None:
        """Open edit mode for ticket."""
        self.click(self.edit_button)
    
    # =========================================================================
    # GETTERS
    # =========================================================================
    
    def get_ticket_number(self) -> str:
        """Get ticket number."""
        return self.get_text(self.ticket_number)
    
    def get_status(self) -> str:
        """Get current ticket status."""
        return self.get_text(self.status_badge)
    
    def get_priority(self) -> str:
        """Get ticket priority."""
        return self.get_text(self.priority_badge)
    
    def get_assignee(self) -> str:
        """Get current assignee."""
        return self.get_text(self.assignee)
    
    def get_comments_count(self) -> int:
        """Get number of comments."""
        return self.comment_items.count()
    
    def get_comments(self) -> List[Dict]:
        """Get all comments."""
        comments = []
        for i in range(self.comment_items.count()):
            item = self.comment_items.nth(i)
            comments.append({
                "author": self.get_text(item.locator(".comment-author")),
                "text": self.get_text(item.locator(".comment-text")),
                "date": self.get_text(item.locator(".comment-date")),
            })
        return comments
    
    # =========================================================================
    # ASSERTIONS
    # =========================================================================
    
    def expect_ticket_loaded(self) -> None:
        """Assert that ticket details have loaded."""
        self.expect_visible(self.ticket_title)
        self.expect_visible(self.status_badge)
    
    def expect_status(self, status: str) -> None:
        """Assert ticket has expected status."""
        self.expect_text(self.status_badge, status)
    
    def expect_priority(self, priority: str) -> None:
        """Assert ticket has expected priority."""
        self.expect_text(self.priority_badge, priority)
    
    def expect_assignee(self, assignee: str) -> None:
        """Assert ticket is assigned to expected user."""
        self.expect_text(self.assignee, assignee)
    
    def expect_comment_added(self, text: str) -> None:
        """Assert that a comment with given text exists."""
        comment = self.page.locator(f"text={text}")
        self.expect_visible(comment)


class CreateTicketPage(BasePage):
    """Page Object for Create Ticket page/modal."""
    
    @property
    def url_pattern(self) -> str:
        return r"/tickets/new"
    
    def _setup_locators(self):
        """Define create ticket page locators."""
        self.form = self.page.locator("[data-testid='create-ticket-form']")
        self.title_input = self.page.get_by_label("Title")
        self.description_input = self.page.get_by_label("Description")
        self.category_select = self.page.get_by_label("Category")
        self.priority_select = self.page.get_by_label("Priority")
        self.submit_button = self.page.get_by_role("button", name="Create Ticket")
        self.cancel_button = self.page.get_by_role("button", name="Cancel")
        self.error_message = self.page.locator("[role='alert']")
        self.title_error = self.page.locator("[data-testid='title-error']")
        self.attachment_input = self.page.locator("input[type='file']")
    
    def navigate_to_create(self) -> None:
        """Navigate to create ticket page."""
        self.navigate("tickets/new")
    
    def create_ticket(
        self,
        title: str,
        description: str,
        category: str = "general",
        priority: str = "medium"
    ) -> None:
        """Fill and submit the create ticket form."""
        self.fill(self.title_input, title)
        self.fill(self.description_input, description)
        self.select_option(self.category_select, category)
        self.select_option(self.priority_select, priority)
        self.click(self.submit_button)
    
    def expect_validation_error(self, field: str, message: str) -> None:
        """Assert validation error for field."""
        error = self.page.locator(f"[data-testid='{field}-error']")
        self.expect_visible(error)
        self.expect_text(error, message)
    
    def expect_ticket_created(self) -> None:
        """Assert ticket was created successfully."""
        self.page.wait_for_url(lambda url: "tickets" in url and "new" not in url)


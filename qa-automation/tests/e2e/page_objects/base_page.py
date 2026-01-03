"""
Base Page Object
=================
Abstract base class for all Page Objects implementing common functionality.
"""

from abc import ABC, abstractmethod
from playwright.sync_api import Page, Locator, expect
from typing import Optional, List
import re


class BasePage(ABC):
    """
    Abstract base class for Page Objects.
    Implements common functionality shared across all pages.
    """
    
    def __init__(self, page: Page):
        self.page = page
        self._setup_locators()
    
    @abstractmethod
    def _setup_locators(self):
        """Define page-specific locators. Must be implemented by subclasses."""
        pass
    
    @property
    @abstractmethod
    def url_pattern(self) -> str:
        """URL pattern for this page. Must be implemented by subclasses."""
        pass
    
    # =========================================================================
    # NAVIGATION
    # =========================================================================
    
    def navigate(self, path: str = "") -> None:
        """Navigate to this page."""
        base_url = self.page.context.browser.contexts[0].pages[0].url.split('#')[0]
        self.page.goto(f"{base_url}#/{path}")
        self.wait_for_page_load()
    
    def wait_for_page_load(self, timeout: int = 10000) -> None:
        """Wait for page to fully load."""
        self.page.wait_for_load_state("networkidle", timeout=timeout)
    
    def is_current_page(self) -> bool:
        """Check if this is the current page."""
        return bool(re.search(self.url_pattern, self.page.url))
    
    def refresh(self) -> None:
        """Refresh the current page."""
        self.page.reload()
        self.wait_for_page_load()
    
    # =========================================================================
    # ELEMENT INTERACTIONS
    # =========================================================================
    
    def click(self, locator: Locator, timeout: int = 5000) -> None:
        """Click an element with wait."""
        locator.wait_for(state="visible", timeout=timeout)
        locator.click()
    
    def fill(self, locator: Locator, text: str, clear_first: bool = True) -> None:
        """Fill a text input."""
        locator.wait_for(state="visible")
        if clear_first:
            locator.clear()
        locator.fill(text)
    
    def select_option(self, locator: Locator, value: str) -> None:
        """Select an option from a dropdown."""
        locator.wait_for(state="visible")
        locator.select_option(value)
    
    def check(self, locator: Locator) -> None:
        """Check a checkbox."""
        locator.wait_for(state="visible")
        if not locator.is_checked():
            locator.check()
    
    def uncheck(self, locator: Locator) -> None:
        """Uncheck a checkbox."""
        locator.wait_for(state="visible")
        if locator.is_checked():
            locator.uncheck()
    
    def hover(self, locator: Locator) -> None:
        """Hover over an element."""
        locator.wait_for(state="visible")
        locator.hover()
    
    def get_text(self, locator: Locator) -> str:
        """Get text content of an element."""
        locator.wait_for(state="visible")
        return locator.text_content() or ""
    
    def get_value(self, locator: Locator) -> str:
        """Get input value."""
        locator.wait_for(state="visible")
        return locator.input_value()
    
    # =========================================================================
    # VISIBILITY & STATE
    # =========================================================================
    
    def is_visible(self, locator: Locator, timeout: int = 3000) -> bool:
        """Check if element is visible."""
        try:
            locator.wait_for(state="visible", timeout=timeout)
            return True
        except:
            return False
    
    def is_enabled(self, locator: Locator) -> bool:
        """Check if element is enabled."""
        return locator.is_enabled()
    
    def wait_for_visible(self, locator: Locator, timeout: int = 10000) -> None:
        """Wait for element to become visible."""
        locator.wait_for(state="visible", timeout=timeout)
    
    def wait_for_hidden(self, locator: Locator, timeout: int = 10000) -> None:
        """Wait for element to become hidden."""
        locator.wait_for(state="hidden", timeout=timeout)
    
    # =========================================================================
    # ASSERTIONS
    # =========================================================================
    
    def expect_visible(self, locator: Locator) -> None:
        """Assert element is visible."""
        expect(locator).to_be_visible()
    
    def expect_hidden(self, locator: Locator) -> None:
        """Assert element is hidden."""
        expect(locator).to_be_hidden()
    
    def expect_text(self, locator: Locator, text: str) -> None:
        """Assert element contains text."""
        expect(locator).to_contain_text(text)
    
    def expect_value(self, locator: Locator, value: str) -> None:
        """Assert input has value."""
        expect(locator).to_have_value(value)
    
    def expect_count(self, locator: Locator, count: int) -> None:
        """Assert element count."""
        expect(locator).to_have_count(count)
    
    # =========================================================================
    # KEYBOARD
    # =========================================================================
    
    def press_key(self, key: str) -> None:
        """Press a keyboard key."""
        self.page.keyboard.press(key)
    
    def type_text(self, text: str) -> None:
        """Type text using keyboard."""
        self.page.keyboard.type(text)
    
    # =========================================================================
    # SCREENSHOTS & DEBUGGING
    # =========================================================================
    
    def take_screenshot(self, name: str) -> bytes:
        """Take a screenshot."""
        return self.page.screenshot(path=f"screenshots/{name}.png")
    
    def get_console_logs(self) -> List[str]:
        """Get console logs (must be collected during page load)."""
        return []  # Would need to be implemented with page.on("console")
    
    # =========================================================================
    # COMMON PAGE ELEMENTS
    # =========================================================================
    
    @property
    def page_title(self) -> str:
        """Get page title."""
        return self.page.title()
    
    @property
    def current_url(self) -> str:
        """Get current URL."""
        return self.page.url
    
    def scroll_to_top(self) -> None:
        """Scroll to top of page."""
        self.page.evaluate("window.scrollTo(0, 0)")
    
    def scroll_to_bottom(self) -> None:
        """Scroll to bottom of page."""
        self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    
    def scroll_into_view(self, locator: Locator) -> None:
        """Scroll element into view."""
        locator.scroll_into_view_if_needed()


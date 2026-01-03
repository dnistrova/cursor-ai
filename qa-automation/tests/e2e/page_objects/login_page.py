"""
Login Page Object
==================
Page Object for authentication pages (login, register, forgot password).
"""

from playwright.sync_api import Page, Locator
from .base_page import BasePage


class LoginPage(BasePage):
    """Page Object for the Login page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/login"
    
    def _setup_locators(self):
        """Define login page locators."""
        # Form elements
        self.email_input = self.page.get_by_label("Email")
        self.password_input = self.page.get_by_label("Password")
        self.remember_me_checkbox = self.page.get_by_label("Remember me")
        self.submit_button = self.page.get_by_role("button", name="Sign in")
        
        # Links
        self.forgot_password_link = self.page.get_by_role("link", name="Forgot password")
        self.register_link = self.page.get_by_role("link", name="Sign up")
        
        # Messages
        self.error_message = self.page.locator("[role='alert']")
        self.success_message = self.page.locator(".success-message")
        
        # OAuth buttons (if applicable)
        self.google_login_button = self.page.get_by_role("button", name="Continue with Google")
        self.github_login_button = self.page.get_by_role("button", name="Continue with GitHub")
    
    # =========================================================================
    # ACTIONS
    # =========================================================================
    
    def navigate_to_login(self) -> None:
        """Navigate to the login page."""
        self.navigate("login")
    
    def login(self, email: str, password: str, remember: bool = False) -> None:
        """
        Perform login with given credentials.
        
        Args:
            email: User email address
            password: User password
            remember: Whether to check "Remember me"
        """
        self.fill(self.email_input, email)
        self.fill(self.password_input, password)
        
        if remember:
            self.check(self.remember_me_checkbox)
        
        self.click(self.submit_button)
    
    def login_as_admin(self) -> None:
        """Login with admin credentials."""
        self.login("admin@example.com", "AdminPass123!")
    
    def login_as_agent(self) -> None:
        """Login with agent credentials."""
        self.login("agent@example.com", "AgentPass123!")
    
    def login_as_customer(self) -> None:
        """Login with customer credentials."""
        self.login("customer@example.com", "CustomerPass123!")
    
    def click_forgot_password(self) -> None:
        """Click the forgot password link."""
        self.click(self.forgot_password_link)
    
    def click_register(self) -> None:
        """Click the register link."""
        self.click(self.register_link)
    
    # =========================================================================
    # ASSERTIONS
    # =========================================================================
    
    def expect_login_error(self, message: str = None) -> None:
        """Assert that login error is displayed."""
        self.expect_visible(self.error_message)
        if message:
            self.expect_text(self.error_message, message)
    
    def expect_login_success(self) -> None:
        """Assert that login was successful (redirected away from login page)."""
        self.page.wait_for_url(lambda url: "login" not in url, timeout=5000)
    
    def expect_on_login_page(self) -> None:
        """Assert that we are on the login page."""
        assert self.is_current_page(), f"Expected to be on login page, but on {self.current_url}"
    
    # =========================================================================
    # GETTERS
    # =========================================================================
    
    def get_error_message(self) -> str:
        """Get the current error message text."""
        return self.get_text(self.error_message)
    
    def get_email_value(self) -> str:
        """Get the current email input value."""
        return self.get_value(self.email_input)


class RegisterPage(BasePage):
    """Page Object for the Registration page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/register"
    
    def _setup_locators(self):
        """Define registration page locators."""
        self.username_input = self.page.get_by_label("Username")
        self.email_input = self.page.get_by_label("Email")
        self.password_input = self.page.get_by_label("Password", exact=True)
        self.confirm_password_input = self.page.get_by_label("Confirm Password")
        self.terms_checkbox = self.page.get_by_label("I agree to the terms")
        self.submit_button = self.page.get_by_role("button", name="Create account")
        self.login_link = self.page.get_by_role("link", name="Sign in")
        self.error_message = self.page.locator("[role='alert']")
        self.password_strength = self.page.locator(".password-strength")
    
    def navigate_to_register(self) -> None:
        """Navigate to the registration page."""
        self.navigate("register")
    
    def register(
        self,
        username: str,
        email: str,
        password: str,
        confirm_password: str = None,
        accept_terms: bool = True
    ) -> None:
        """
        Fill and submit registration form.
        
        Args:
            username: Desired username
            email: Email address
            password: Password
            confirm_password: Password confirmation (defaults to password)
            accept_terms: Whether to accept terms
        """
        self.fill(self.username_input, username)
        self.fill(self.email_input, email)
        self.fill(self.password_input, password)
        self.fill(self.confirm_password_input, confirm_password or password)
        
        if accept_terms:
            self.check(self.terms_checkbox)
        
        self.click(self.submit_button)
    
    def expect_registration_error(self, message: str = None) -> None:
        """Assert that registration error is displayed."""
        self.expect_visible(self.error_message)
        if message:
            self.expect_text(self.error_message, message)
    
    def expect_registration_success(self) -> None:
        """Assert that registration was successful."""
        self.page.wait_for_url(lambda url: "register" not in url, timeout=5000)


class ForgotPasswordPage(BasePage):
    """Page Object for the Forgot Password page."""
    
    @property
    def url_pattern(self) -> str:
        return r"/forgot-password"
    
    def _setup_locators(self):
        """Define forgot password page locators."""
        self.email_input = self.page.get_by_label("Email")
        self.submit_button = self.page.get_by_role("button", name="Reset password")
        self.back_to_login_link = self.page.get_by_role("link", name="Back to login")
        self.success_message = self.page.locator(".success-message")
        self.error_message = self.page.locator("[role='alert']")
    
    def navigate_to_forgot_password(self) -> None:
        """Navigate to the forgot password page."""
        self.navigate("forgot-password")
    
    def request_password_reset(self, email: str) -> None:
        """Request password reset for email."""
        self.fill(self.email_input, email)
        self.click(self.submit_button)
    
    def expect_reset_email_sent(self) -> None:
        """Assert that reset email was sent successfully."""
        self.expect_visible(self.success_message)


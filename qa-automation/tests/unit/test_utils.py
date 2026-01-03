"""
Unit Test Utilities and Base Classes
=====================================
Provides common utilities for unit testing across the project.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
import json


class BaseUnitTest:
    """Base class for all unit tests with common utilities."""
    
    @pytest.fixture(autouse=True)
    def setup_method(self):
        """Setup that runs before each test."""
        self.mock_datetime = datetime(2024, 1, 15, 12, 0, 0)
        yield
        # Cleanup after test
    
    def create_mock_response(self, status_code=200, data=None):
        """Create a mock HTTP response."""
        mock_response = Mock()
        mock_response.status_code = status_code
        mock_response.json.return_value = data or {}
        mock_response.text = json.dumps(data or {})
        return mock_response
    
    def create_mock_user(self, **kwargs):
        """Create a mock user object."""
        defaults = {
            'id': 1,
            'email': 'test@example.com',
            'username': 'testuser',
            'role': 'user',
            'is_active': True,
            'created_at': self.mock_datetime
        }
        defaults.update(kwargs)
        return Mock(**defaults)
    
    def create_mock_ticket(self, **kwargs):
        """Create a mock ticket object."""
        defaults = {
            'id': 1,
            'ticket_number': 'TICK-20240115-0001',
            'title': 'Test Ticket',
            'description': 'Test description',
            'status': 'open',
            'priority': 'medium',
            'created_at': self.mock_datetime
        }
        defaults.update(kwargs)
        return Mock(**defaults)


class TestAssertions:
    """Custom assertions for common test patterns."""
    
    @staticmethod
    def assert_valid_json_response(response):
        """Assert that response is valid JSON with expected structure."""
        assert response.status_code in [200, 201]
        data = response.get_json()
        assert data is not None
        return data
    
    @staticmethod
    def assert_error_response(response, expected_status, error_key='error'):
        """Assert that response is an error with expected status."""
        assert response.status_code == expected_status
        data = response.get_json()
        assert error_key in data
        return data
    
    @staticmethod
    def assert_pagination(data, expected_keys=None):
        """Assert that response has pagination structure."""
        expected_keys = expected_keys or ['items', 'total', 'page', 'per_page', 'pages']
        for key in expected_keys:
            assert key in data, f"Missing pagination key: {key}"
    
    @staticmethod
    def assert_datetime_format(date_string, format='%Y-%m-%dT%H:%M:%S'):
        """Assert that string is in expected datetime format."""
        try:
            datetime.strptime(date_string.split('.')[0], format)
        except ValueError:
            pytest.fail(f"Invalid datetime format: {date_string}")


# Decorators for common test patterns
def skip_in_ci(reason="Skipped in CI environment"):
    """Skip test when running in CI."""
    import os
    return pytest.mark.skipif(
        os.environ.get('CI') == 'true',
        reason=reason
    )


def requires_redis(func):
    """Skip test if Redis is not available."""
    import os
    return pytest.mark.skipif(
        not os.environ.get('REDIS_URL'),
        reason="Redis not available"
    )(func)


def requires_database(func):
    """Skip test if database is not available."""
    import os
    return pytest.mark.skipif(
        not os.environ.get('DATABASE_URL'),
        reason="Database not available"
    )(func)


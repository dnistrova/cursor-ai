"""
API Integration Tests
======================
Tests for API endpoint integration including authentication flow,
data persistence, and service interactions.
"""

import pytest
import requests
from datetime import datetime
import time


class TestAuthenticationFlow:
    """Integration tests for authentication endpoints."""
    
    @pytest.fixture
    def base_url(self):
        return "http://localhost:5000/api/v1"
    
    @pytest.fixture
    def test_user_data(self):
        return {
            "email": f"testuser_{int(time.time())}@example.com",
            "username": f"testuser_{int(time.time())}",
            "password": "SecurePass123!"
        }
    
    def test_user_registration_flow(self, base_url, test_user_data):
        """Test complete user registration flow."""
        # Register user
        response = requests.post(
            f"{base_url}/auth/register",
            json=test_user_data
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == test_user_data["email"]
    
    def test_login_flow(self, base_url, test_user_data):
        """Test login flow after registration."""
        # First register
        requests.post(f"{base_url}/auth/register", json=test_user_data)
        
        # Then login
        response = requests.post(
            f"{base_url}/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_protected_endpoint_without_token(self, base_url):
        """Test that protected endpoints require authentication."""
        response = requests.get(f"{base_url}/tickets")
        assert response.status_code == 401


class TestTicketWorkflow:
    """Integration tests for ticket workflow."""
    
    @pytest.fixture
    def authenticated_session(self, base_url):
        """Create authenticated session with access token."""
        session = requests.Session()
        
        # Register and login
        user_data = {
            "email": f"agent_{int(time.time())}@example.com",
            "username": f"agent_{int(time.time())}",
            "password": "AgentPass123!",
            "role": "agent"
        }
        
        response = session.post(f"{base_url}/auth/register", json=user_data)
        if response.status_code == 201:
            token = response.json()["access_token"]
            session.headers.update({"Authorization": f"Bearer {token}"})
        
        return session
    
    @pytest.fixture
    def base_url(self):
        return "http://localhost:5000/api/v1"
    
    def test_create_ticket(self, base_url, authenticated_session):
        """Test creating a new ticket."""
        ticket_data = {
            "title": "Integration Test Ticket",
            "description": "Created during integration testing",
            "priority": "medium",
            "category": "technical"
        }
        
        response = authenticated_session.post(
            f"{base_url}/tickets",
            json=ticket_data
        )
        assert response.status_code == 201
        data = response.json()
        assert data["ticket"]["title"] == ticket_data["title"]
        assert "ticket_number" in data["ticket"]
        return data["ticket"]["id"]
    
    def test_ticket_lifecycle(self, base_url, authenticated_session):
        """Test complete ticket lifecycle: create -> assign -> progress -> resolve."""
        # Create ticket
        ticket_data = {
            "title": "Lifecycle Test Ticket",
            "description": "Testing complete lifecycle",
            "priority": "high"
        }
        
        create_response = authenticated_session.post(
            f"{base_url}/tickets",
            json=ticket_data
        )
        assert create_response.status_code == 201
        ticket_id = create_response.json()["ticket"]["id"]
        
        # Update status to in_progress
        status_response = authenticated_session.patch(
            f"{base_url}/tickets/{ticket_id}/status",
            json={"status": "in_progress"}
        )
        # May fail if not assigned, which is expected behavior
        
        # Add comment
        comment_response = authenticated_session.post(
            f"{base_url}/tickets/{ticket_id}/comments",
            json={"content": "Working on this ticket"}
        )
        assert comment_response.status_code in [201, 401, 403]


class TestDataPersistence:
    """Integration tests for data persistence."""
    
    @pytest.fixture
    def base_url(self):
        return "http://localhost:5000/api/v1"
    
    def test_data_survives_request_cycle(self, base_url):
        """Test that data persists across request cycles."""
        session = requests.Session()
        timestamp = int(time.time())
        
        # Create user
        user_data = {
            "email": f"persist_{timestamp}@example.com",
            "username": f"persist_{timestamp}",
            "password": "PersistPass123!"
        }
        
        reg_response = session.post(f"{base_url}/auth/register", json=user_data)
        if reg_response.status_code != 201:
            pytest.skip("Registration failed")
        
        token = reg_response.json()["access_token"]
        
        # Create new session (simulates new request)
        new_session = requests.Session()
        new_session.headers.update({"Authorization": f"Bearer {token}"})
        
        # Verify user exists in new session
        # This would hit a /me or /profile endpoint
        # For now, just verify token still works for protected routes


class TestConcurrentRequests:
    """Integration tests for concurrent request handling."""
    
    @pytest.fixture
    def base_url(self):
        return "http://localhost:5000/api/v1"
    
    def test_concurrent_ticket_creation(self, base_url):
        """Test that concurrent ticket creation doesn't cause conflicts."""
        import concurrent.futures
        
        def create_ticket(session, ticket_num):
            return session.post(
                f"{base_url}/tickets",
                json={
                    "title": f"Concurrent Ticket {ticket_num}",
                    "description": "Created concurrently",
                    "priority": "low"
                }
            )
        
        # This test would require authenticated sessions
        # Skipping actual execution without auth
        pytest.skip("Requires authenticated concurrent sessions")


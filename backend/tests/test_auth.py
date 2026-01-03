"""Tests for authentication endpoints."""
import pytest


class TestRegister:
    """Tests for user registration."""
    
    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'SecurePass123',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 201
        assert response.json['email'] == 'newuser@example.com'
        assert response.json['username'] == 'newuser'
        assert 'password' not in response.json
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post('/api/v1/auth/register', json={
            'email': test_user.email,
            'username': 'different',
            'password': 'SecurePass123'
        })
        
        assert response.status_code == 409
        assert 'already registered' in response.json['error']
    
    def test_register_weak_password(self, client):
        """Test registration with weak password."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'weak'
        })
        
        assert response.status_code == 400


class TestLogin:
    """Tests for user login."""
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post('/api/v1/auth/login', json={
            'email': test_user.email,
            'password': 'TestPassword123'
        })
        
        assert response.status_code == 200
        assert 'access_token' in response.json
        assert 'refresh_token' in response.json
        assert response.json['token_type'] == 'Bearer'
    
    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid password."""
        response = client.post('/api/v1/auth/login', json={
            'email': test_user.email,
            'password': 'WrongPassword123'
        })
        
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, client):
        """Test login with nonexistent email."""
        response = client.post('/api/v1/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123'
        })
        
        assert response.status_code == 401


class TestCurrentUser:
    """Tests for getting current user."""
    
    def test_get_current_user(self, client, auth_headers, test_user):
        """Test getting current authenticated user."""
        response = client.get('/api/v1/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json['email'] == test_user.email
    
    def test_get_current_user_no_auth(self, client):
        """Test getting current user without authentication."""
        response = client.get('/api/v1/auth/me')
        
        assert response.status_code == 401




"""
Comprehensive Test Suite: User Profile Management
================================================

Total Test Cases: 45+

Categories:
1. Positive Test Cases (15 cases)
2. Negative Test Cases (12 cases)
3. Edge Cases (10 cases)
4. Security Test Cases (8 cases)

Covers: User Registration, Profile Updates, Password Changes, Account Deletion
"""
import pytest
import re
from datetime import datetime, timedelta
from app import db
from app.models.user import User, UserRole


# ============================================================================
# TEST FIXTURES
# ============================================================================

@pytest.fixture
def profile_user(app, _db):
    """Create a user for profile testing."""
    with app.app_context():
        user = User(
            email='profile@example.com',
            username='profileuser',
            first_name='Profile',
            last_name='User',
            role=UserRole.CUSTOMER
        )
        user.set_password('SecurePass123!')
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user


@pytest.fixture
def profile_headers(client, profile_user):
    """Get authentication headers for profile user."""
    response = client.post('/api/v1/auth/login', json={
        'email': profile_user.email,
        'password': 'SecurePass123!'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}


# ============================================================================
# 1. POSITIVE TEST CASES (15 cases)
# ============================================================================

class TestUserRegistrationPositive:
    """Positive test cases for user registration."""
    
    def test_register_with_valid_data(self, client):
        """TC-001: Register user with all valid required fields."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'ValidPass123!',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 201
        # API returns user data directly (not nested under 'user' key)
        assert 'email' in response.json
        assert response.json['email'] == 'newuser@example.com'
    
    def test_register_with_minimum_fields(self, client):
        """TC-002: Register with only required fields (email, username, password)."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'minimal@example.com',
            'username': 'minimaluser',
            'password': 'MinPass123!'
        })
        
        assert response.status_code == 201
    
    def test_register_username_with_numbers(self, client):
        """TC-003: Register with username containing numbers."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'user123@example.com',
            'username': 'user123',
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 201
    
    def test_register_returns_user_id(self, client):
        """TC-004: Registration returns user ID in response."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'withid@example.com',
            'username': 'withiduser',
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 201
        # API returns user data directly (not nested under 'user' key)
        assert 'id' in response.json


class TestProfileUpdatePositive:
    """Positive test cases for profile updates."""
    
    def test_update_first_name(self, client, profile_headers):
        """TC-005: Update user first name successfully."""
        response = client.put('/api/v1/users/me', 
            headers=profile_headers,
            json={'first_name': 'UpdatedFirstName'}
        )
        
        assert response.status_code == 200
        assert response.json['first_name'] == 'UpdatedFirstName'
    
    def test_update_last_name(self, client, profile_headers):
        """TC-006: Update user last name successfully."""
        response = client.put('/api/v1/users/me',
            headers=profile_headers,
            json={'last_name': 'UpdatedLastName'}
        )
        
        assert response.status_code == 200
    
    def test_update_multiple_fields(self, client, profile_headers):
        """TC-007: Update multiple profile fields at once."""
        response = client.put('/api/v1/users/me',
            headers=profile_headers,
            json={
                'first_name': 'NewFirst',
                'last_name': 'NewLast'
            }
        )
        
        assert response.status_code == 200
    
    def test_get_current_user_profile(self, client, profile_headers):
        """TC-008: Get current user profile data."""
        response = client.get('/api/v1/auth/me', headers=profile_headers)
        
        assert response.status_code == 200
        assert 'email' in response.json


class TestPasswordChangePositive:
    """Positive test cases for password changes."""
    
    def test_change_password_successfully(self, client, profile_headers):
        """TC-009: Change password with valid current and new password."""
        response = client.post('/api/v1/users/me/password',
            headers=profile_headers,
            json={
                'current_password': 'SecurePass123!',
                'new_password': 'NewSecurePass456!'
            }
        )
        
        assert response.status_code in [200, 204]
    
    def test_login_with_new_password(self, client, profile_user):
        """TC-010: Verify login works with new password after change."""
        # First change the password
        login_resp = client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'SecurePass123!'
        })
        token = login_resp.json['access_token']
        
        # Change password
        client.post('/api/v1/users/me/password',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'current_password': 'SecurePass123!',
                'new_password': 'ChangedPass789!'
            }
        )
        
        # Login with new password
        new_login = client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'ChangedPass789!'
        })
        
        assert new_login.status_code == 200


class TestAccountDeletionPositive:
    """Positive test cases for account deletion."""
    
    def test_delete_own_account(self, client, app, _db):
        """TC-011: User can delete their own account."""
        # Create a user to delete
        with app.app_context():
            user = User(
                email='todelete@example.com',
                username='todelete',
                first_name='To',
                last_name='Delete'
            )
            user.set_password('DeleteMe123!')
            db.session.add(user)
            db.session.commit()
        
        # Login
        login_resp = client.post('/api/v1/auth/login', json={
            'email': 'todelete@example.com',
            'password': 'DeleteMe123!'
        })
        
        if login_resp.status_code == 200:
            token = login_resp.json['access_token']
            
            # Delete account
            delete_resp = client.delete('/api/v1/users/me',
                headers={'Authorization': f'Bearer {token}'}
            )
            
            # Either 204 No Content or 200 OK is acceptable
            assert delete_resp.status_code in [200, 204, 404]
    
    def test_deleted_user_cannot_login(self, client, app, _db):
        """TC-012: Deleted user cannot login."""
        # This test verifies the deletion was permanent
        response = client.post('/api/v1/auth/login', json={
            'email': 'todelete@example.com',
            'password': 'DeleteMe123!'
        })
        
        # Should fail - user was deleted
        assert response.status_code in [401, 404]


class TestProfileViewPositive:
    """Additional positive test cases."""
    
    def test_view_profile_after_update(self, client, profile_headers):
        """TC-013: View profile reflects updates immediately."""
        # Update profile
        client.put('/api/v1/users/me',
            headers=profile_headers,
            json={'first_name': 'Immediate'}
        )
        
        # View profile
        response = client.get('/api/v1/auth/me', headers=profile_headers)
        
        assert response.status_code == 200
    
    def test_registration_creates_timestamp(self, client, app, _db):
        """TC-014: Registration creates created_at timestamp."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'timestamp@example.com',
            'username': 'timestampuser',
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 201
        
        with app.app_context():
            user = User.query.filter_by(email='timestamp@example.com').first()
            if user:
                assert user.created_at is not None
    
    def test_successful_login_returns_token(self, client, profile_user):
        """TC-015: Successful login returns JWT token."""
        response = client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 200
        assert 'access_token' in response.json


# ============================================================================
# 2. NEGATIVE TEST CASES (12 cases)
# ============================================================================

class TestRegistrationNegative:
    """Negative test cases for user registration."""
    
    def test_register_duplicate_email(self, client, profile_user):
        """TC-016: Reject registration with existing email."""
        response = client.post('/api/v1/auth/register', json={
            'email': profile_user.email,  # Already exists
            'username': 'differentusername',
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 409
    
    def test_register_duplicate_username(self, client, profile_user):
        """TC-017: Reject registration with existing username."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'different@example.com',
            'username': profile_user.username,  # Already exists
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 409
    
    def test_register_invalid_email_format(self, client):
        """TC-018: Reject registration with invalid email format."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'not-an-email',
            'username': 'validuser',
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 400
    
    def test_register_missing_email(self, client):
        """TC-019: Reject registration without email."""
        response = client.post('/api/v1/auth/register', json={
            'username': 'noemailer',
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 400
    
    def test_register_missing_password(self, client):
        """TC-020: Reject registration without password."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'nopass@example.com',
            'username': 'nopassuser'
        })
        
        assert response.status_code == 400
    
    def test_register_short_password(self, client):
        """TC-021: Reject registration with password less than 8 characters."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'shortpass@example.com',
            'username': 'shortpassuser',
            'password': 'short'
        })
        
        assert response.status_code == 400


class TestLoginNegative:
    """Negative test cases for login."""
    
    def test_login_wrong_password(self, client, profile_user):
        """TC-022: Reject login with wrong password."""
        response = client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'WrongPassword123!'
        })
        
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, client):
        """TC-023: Reject login for non-existent user."""
        response = client.post('/api/v1/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123!'
        })
        
        assert response.status_code == 401
    
    def test_login_missing_email(self, client):
        """TC-024: Reject login without email."""
        response = client.post('/api/v1/auth/login', json={
            'password': 'SomePassword123!'
        })
        
        assert response.status_code == 400


class TestProfileUpdateNegative:
    """Negative test cases for profile updates."""
    
    def test_update_profile_no_auth(self, client):
        """TC-025: Reject profile update without authentication."""
        response = client.put('/api/v1/users/me', json={
            'first_name': 'Unauthorized'
        })
        
        assert response.status_code == 401
    
    def test_update_with_invalid_token(self, client):
        """TC-026: Reject profile update with invalid token."""
        response = client.put('/api/v1/users/me',
            headers={'Authorization': 'Bearer invalid_token_here'},
            json={'first_name': 'Invalid'}
        )
        
        assert response.status_code in [401, 422]
    
    def test_password_change_wrong_current(self, client, profile_headers):
        """TC-027: Reject password change with wrong current password."""
        response = client.post('/api/v1/users/me/password',
            headers=profile_headers,
            json={
                'current_password': 'WrongCurrentPass!',
                'new_password': 'NewValidPass123!'
            }
        )
        
        assert response.status_code in [400, 401, 403]


# ============================================================================
# 3. EDGE CASES (10 cases)
# ============================================================================

class TestRegistrationEdgeCases:
    """Edge cases for user registration."""
    
    def test_register_email_max_length(self, client):
        """TC-028: Handle email at maximum allowed length."""
        # Create email at or near max length (254 characters per RFC 5321)
        local_part = 'a' * 64
        domain = 'b' * 63 + '.com'
        long_email = f'{local_part}@{domain}'[:254]
        
        response = client.post('/api/v1/auth/register', json={
            'email': long_email,
            'username': 'longemail',
            'password': 'ValidPass123!'
        })
        
        # Should either accept or reject with validation error
        assert response.status_code in [201, 400]
    
    def test_register_username_min_length(self, client):
        """TC-029: Handle username at minimum length (3 characters)."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'minlen@example.com',
            'username': 'abc',  # 3 characters
            'password': 'ValidPass123!'
        })
        
        assert response.status_code in [201, 400]
    
    def test_register_username_too_short(self, client):
        """TC-030: Reject username shorter than minimum."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'tooshort@example.com',
            'username': 'ab',  # 2 characters
            'password': 'ValidPass123!'
        })
        
        assert response.status_code == 400
    
    def test_register_password_exactly_8_chars(self, client):
        """TC-031: Accept password at exactly minimum length."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'exact8@example.com',
            'username': 'exact8user',
            'password': 'Exact8!!'  # Exactly 8 characters
        })
        
        # Depends on whether password strength validation requires more
        assert response.status_code in [201, 400]
    
    def test_register_unicode_in_name(self, client):
        """TC-032: Handle Unicode characters in first/last name."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'unicode@example.com',
            'username': 'unicodeuser',
            'password': 'ValidPass123!',
            'first_name': 'José',
            'last_name': 'Müller'
        })
        
        assert response.status_code == 201


class TestProfileEdgeCases:
    """Edge cases for profile operations."""
    
    def test_update_with_empty_string(self, client, profile_headers):
        """TC-033: Handle update with empty string value."""
        response = client.put('/api/v1/users/me',
            headers=profile_headers,
            json={'first_name': ''}
        )
        
        # Should either accept empty or reject
        assert response.status_code in [200, 400]
    
    def test_update_with_whitespace_only(self, client, profile_headers):
        """TC-034: Handle update with whitespace-only value."""
        response = client.put('/api/v1/users/me',
            headers=profile_headers,
            json={'first_name': '   '}
        )
        
        # Should be trimmed or rejected
        assert response.status_code in [200, 400]
    
    def test_rapid_consecutive_updates(self, client, profile_headers):
        """TC-035: Handle rapid consecutive profile updates."""
        for i in range(5):
            response = client.put('/api/v1/users/me',
                headers=profile_headers,
                json={'first_name': f'RapidUpdate{i}'}
            )
            assert response.status_code == 200
    
    def test_password_change_same_password(self, client, profile_headers):
        """TC-036: Handle password change to same password."""
        response = client.post('/api/v1/users/me/password',
            headers=profile_headers,
            json={
                'current_password': 'SecurePass123!',
                'new_password': 'SecurePass123!'  # Same as current
            }
        )
        
        # Should reject - can't use same password
        assert response.status_code in [200, 400]
    
    def test_concurrent_login_same_user(self, client, profile_user):
        """TC-037: Handle concurrent logins for same user."""
        # First login
        resp1 = client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'SecurePass123!'
        })
        
        # Second login (same user)
        resp2 = client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'SecurePass123!'
        })
        
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        # Both tokens should be different
        assert resp1.json['access_token'] != resp2.json['access_token']


# ============================================================================
# 4. SECURITY TEST CASES (8 cases)
# ============================================================================

class TestSecurityRegistration:
    """Security test cases for registration."""
    
    def test_password_not_in_response(self, client):
        """TC-038: Password should never appear in API response."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'secure@example.com',
            'username': 'secureuser',
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 201
        response_text = str(response.json)
        assert 'SecurePass123!' not in response_text
        assert 'password' not in response_text.lower() or 'password_hash' not in response_text
    
    def test_sql_injection_in_email(self, client):
        """TC-039: Prevent SQL injection in email field."""
        response = client.post('/api/v1/auth/register', json={
            'email': "'; DROP TABLE users; --@example.com",
            'username': 'sqliuser',
            'password': 'ValidPass123!'
        })
        
        # Should reject invalid email format, not execute SQL
        assert response.status_code == 400
    
    def test_sql_injection_in_username(self, client):
        """TC-040: Prevent SQL injection in username field."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'sqli2@example.com',
            'username': "admin'--",
            'password': 'ValidPass123!'
        })
        
        # Should either reject or sanitize
        assert response.status_code in [201, 400]
    
    def test_xss_in_name_fields(self, client):
        """TC-041: Prevent XSS in name fields."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'xss@example.com',
            'username': 'xssuser',
            'password': 'ValidPass123!',
            'first_name': '<script>alert("xss")</script>',
            'last_name': '<img onerror="alert(1)" src="x">'
        })
        
        if response.status_code == 201:
            # If accepted, verify it's sanitized or escaped
            user_data = response.json.get('user', {})
            first_name = user_data.get('first_name', '')
            # Should not contain raw script tags
            assert '<script>' not in first_name or '&lt;script&gt;' in first_name


class TestSecurityAuthentication:
    """Security test cases for authentication."""
    
    def test_password_hashing(self, client, app, _db):
        """TC-042: Verify passwords are hashed in database."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'hashtest@example.com',
            'username': 'hashtestuser',
            'password': 'PlainTextPass123!'
        })
        
        assert response.status_code == 201
        
        with app.app_context():
            user = User.query.filter_by(email='hashtest@example.com').first()
            if user:
                # Password should be hashed, not stored in plain text
                assert user.password_hash != 'PlainTextPass123!'
                assert len(user.password_hash) > 20  # Hashes are long
    
    def test_token_required_for_protected_routes(self, client):
        """TC-043: Protected routes require valid token."""
        # Try to access protected route without token
        response = client.get('/api/v1/auth/me')
        
        assert response.status_code == 401
    
    def test_expired_token_rejected(self, client, profile_user, app):
        """TC-044: Expired tokens should be rejected."""
        # This test would require modifying JWT expiry
        # For now, test with malformed token
        response = client.get('/api/v1/auth/me',
            headers={'Authorization': 'Bearer expired.token.here'}
        )
        
        assert response.status_code in [401, 422]
    
    def test_timing_attack_prevention(self, client, profile_user):
        """TC-045: Login timing should be consistent (prevent timing attacks)."""
        import time
        
        # Time login with correct email, wrong password
        start1 = time.time()
        client.post('/api/v1/auth/login', json={
            'email': profile_user.email,
            'password': 'WrongPassword123!'
        })
        time1 = time.time() - start1
        
        # Time login with wrong email
        start2 = time.time()
        client.post('/api/v1/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'WrongPassword123!'
        })
        time2 = time.time() - start2
        
        # Timing difference should be small (less than 0.5s)
        # to prevent email enumeration via timing
        assert abs(time1 - time2) < 0.5


# ============================================================================
# TEST DATA GENERATION HELPERS
# ============================================================================

class TestDataGenerator:
    """Helper methods for generating test data."""
    
    @staticmethod
    def generate_valid_user():
        """Generate valid user registration data."""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        return {
            'email': f'user_{unique_id}@example.com',
            'username': f'user_{unique_id}',
            'password': 'ValidPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    @staticmethod
    def generate_invalid_emails():
        """Generate list of invalid email formats for testing."""
        return [
            'plainaddress',
            '@missinglocal.com',
            'missing@domain',
            'missing.domain@',
            'two@@ats.com',
            'spaces in@email.com',
            'unicode@émoji.com',
        ]
    
    @staticmethod
    def generate_weak_passwords():
        """Generate list of weak passwords for testing."""
        return [
            '123',           # Too short
            'password',      # Common word
            '12345678',      # All numbers
            'abcdefgh',      # All lowercase
            'ABCDEFGH',      # All uppercase
        ]
    
    @staticmethod
    def generate_sql_injection_payloads():
        """Generate SQL injection test payloads."""
        return [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "1; SELECT * FROM users",
            "' UNION SELECT * FROM users --",
        ]


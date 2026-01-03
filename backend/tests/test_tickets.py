"""Comprehensive tests for Customer Support Ticket System - 25+ test cases."""
import pytest
from datetime import datetime, timedelta
from app.models.ticket import Ticket, TicketStatus, TicketPriority, TicketCategory, TicketComment
from app.models.user import User, UserRole


class TestTicketCreation:
    """Tests for FR-001: Ticket creation with validation."""
    
    def test_create_ticket_success(self, client, auth_headers):
        """Test creating a ticket with valid data."""
        ticket_data = {
            'subject': 'Cannot login to my account',
            'description': 'I am unable to login to my account since yesterday. I have tried resetting my password but it still does not work.',
            'priority': 'high',
            'category': 'technical',
            'customer_email': 'customer@example.com'
        }
        
        response = client.post(
            '/api/v1/tickets',
            json=ticket_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json
        assert data['status'] == 'success'
        assert data['data']['subject'] == ticket_data['subject']
        assert data['data']['status'] == 'open'
        assert 'TICK-' in data['data']['ticket_number']
    
    def test_create_ticket_validation_short_subject(self, client, auth_headers):
        """Test validation: subject too short (< 5 characters)."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Hi',
                'description': 'This is a valid description that is long enough.',
                'category': 'general',
                'customer_email': 'test@example.com'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'subject' in response.json.get('errors', {})
    
    def test_create_ticket_validation_short_description(self, client, auth_headers):
        """Test validation: description too short (< 20 characters)."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Valid subject here',
                'description': 'Too short',
                'category': 'general',
                'customer_email': 'test@example.com'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'description' in response.json.get('errors', {})
    
    def test_create_ticket_validation_invalid_email(self, client, auth_headers):
        """Test validation: invalid email format."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Valid subject here',
                'description': 'This is a valid description that is long enough.',
                'category': 'general',
                'customer_email': 'invalid-email'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_create_ticket_validation_invalid_priority(self, client, auth_headers):
        """Test validation: invalid priority level."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Valid subject here',
                'description': 'This is a valid description that is long enough.',
                'category': 'general',
                'customer_email': 'test@example.com',
                'priority': 'super_urgent'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_create_ticket_validation_invalid_category(self, client, auth_headers):
        """Test validation: invalid category."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Valid subject here',
                'description': 'This is a valid description that is long enough.',
                'category': 'unknown_category',
                'customer_email': 'test@example.com'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_create_ticket_unauthorized(self, client):
        """Test creating ticket without authentication."""
        response = client.post('/api/v1/tickets', json={
            'subject': 'Test',
            'description': 'Test',
            'category': 'general',
            'customer_email': 'test@example.com'
        })
        
        assert response.status_code == 401


class TestTicketNumber:
    """Tests for FR-002: Auto-generate ticket numbers."""
    
    def test_ticket_number_format(self, client, auth_headers):
        """Test ticket number follows format TICK-YYYYMMDD-XXXX."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Test ticket for number format',
                'description': 'This is a test to verify ticket number format.',
                'category': 'general',
                'customer_email': 'test@example.com'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        ticket_number = response.json['data']['ticket_number']
        
        # Verify format: TICK-YYYYMMDD-XXXX
        parts = ticket_number.split('-')
        assert len(parts) == 3
        assert parts[0] == 'TICK'
        assert len(parts[1]) == 8  # YYYYMMDD
        assert parts[1].isdigit()
        assert len(parts[2]) == 4  # XXXX
        assert parts[2].isdigit()
    
    def test_ticket_numbers_are_unique(self, client, auth_headers):
        """Test that consecutive tickets have unique numbers."""
        ticket_data = {
            'subject': 'Test ticket for uniqueness',
            'description': 'This is a test to verify ticket numbers are unique.',
            'category': 'general',
            'customer_email': 'test@example.com'
        }
        
        response1 = client.post('/api/v1/tickets', json=ticket_data, headers=auth_headers)
        response2 = client.post('/api/v1/tickets', json=ticket_data, headers=auth_headers)
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        assert response1.json['data']['ticket_number'] != response2.json['data']['ticket_number']


class TestTicketAssignment:
    """Tests for FR-005, FR-006: Ticket assignment."""
    
    def test_assign_ticket_admin(self, client, admin_headers, test_ticket, agent_user):
        """Test admin can assign ticket to agent."""
        response = client.post(
            f'/api/v1/tickets/{test_ticket.id}/assign',
            json={'agent_id': agent_user.id},
            headers=admin_headers
        )
        
        assert response.status_code == 200
        assert response.json['data']['assigned_to_id'] == agent_user.id
        assert response.json['data']['status'] == 'assigned'
    
    def test_assign_ticket_forbidden_non_admin(self, client, auth_headers, test_ticket, agent_user):
        """Test non-admin cannot assign tickets."""
        response = client.post(
            f'/api/v1/tickets/{test_ticket.id}/assign',
            json={'agent_id': agent_user.id},
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_assign_ticket_invalid_agent(self, client, admin_headers, test_ticket, test_user):
        """Test cannot assign to non-agent user."""
        response = client.post(
            f'/api/v1/tickets/{test_ticket.id}/assign',
            json={'agent_id': test_user.id},
            headers=admin_headers
        )
        
        assert response.status_code == 400


class TestTicketStatusManagement:
    """Tests for FR-011, FR-012: Status management with transitions."""
    
    def test_valid_status_transition(self, client, agent_headers, assigned_ticket):
        """Test valid status transition: assigned -> in_progress."""
        response = client.put(
            f'/api/v1/tickets/{assigned_ticket.id}/status',
            json={'status': 'in_progress'},
            headers=agent_headers
        )
        
        assert response.status_code == 200
        assert response.json['data']['status'] == 'in_progress'
    
    def test_invalid_status_transition(self, client, agent_headers, test_ticket):
        """Test invalid status transition: open -> resolved."""
        response = client.put(
            f'/api/v1/tickets/{test_ticket.id}/status',
            json={'status': 'resolved'},
            headers=agent_headers
        )
        
        assert response.status_code == 400
        assert 'Invalid status transition' in response.json['message']
    
    def test_status_resolved_sets_timestamp(self, client, agent_headers, in_progress_ticket, app):
        """Test resolving ticket sets resolved_at timestamp."""
        response = client.put(
            f'/api/v1/tickets/{in_progress_ticket.id}/status',
            json={'status': 'resolved'},
            headers=agent_headers
        )
        
        assert response.status_code == 200
        assert response.json['data']['resolved_at'] is not None
    
    def test_customer_can_reopen_resolved(self, client, auth_headers, resolved_ticket):
        """Test customer can reopen resolved ticket."""
        response = client.put(
            f'/api/v1/tickets/{resolved_ticket.id}/status',
            json={'status': 'reopened'},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.json['data']['status'] == 'reopened'


class TestTicketComments:
    """Tests for FR-015, FR-016: Comments system."""
    
    def test_add_public_comment(self, client, auth_headers, test_ticket):
        """Test adding a public comment to a ticket."""
        response = client.post(
            f'/api/v1/tickets/{test_ticket.id}/comments',
            json={'content': 'This is a helpful comment.'},
            headers=auth_headers
        )
        
        assert response.status_code == 201
        assert response.json['data']['content'] == 'This is a helpful comment.'
        assert response.json['data']['is_internal'] == False
    
    def test_add_internal_comment_agent(self, client, agent_headers, assigned_ticket):
        """Test agent can add internal comment."""
        response = client.post(
            f'/api/v1/tickets/{assigned_ticket.id}/comments',
            json={'content': 'Internal note about this ticket.', 'is_internal': True},
            headers=agent_headers
        )
        
        assert response.status_code == 201
        assert response.json['data']['is_internal'] == True
    
    def test_customer_cannot_add_internal_comment(self, client, auth_headers, test_ticket):
        """Test customer's internal comments are converted to public."""
        response = client.post(
            f'/api/v1/tickets/{test_ticket.id}/comments',
            json={'content': 'Trying internal comment.', 'is_internal': True},
            headers=auth_headers
        )
        
        assert response.status_code == 201
        # Should be converted to public
        assert response.json['data']['is_internal'] == False
    
    def test_customer_cannot_see_internal_comments(self, client, auth_headers, ticket_with_internal_comment):
        """Test customers don't see internal comments."""
        response = client.get(
            f'/api/v1/tickets/{ticket_with_internal_comment.id}/comments',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        # Should not include internal comments
        for comment in response.json['data']['comments']:
            assert comment['is_internal'] == False


class TestTicketPriority:
    """Tests for FR-020, FR-021: Priority and SLA."""
    
    def test_priority_sets_sla(self, client, auth_headers, app):
        """Test creating ticket with priority sets SLA deadlines."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Urgent issue needs attention',
                'description': 'This is an urgent issue that requires immediate attention.',
                'category': 'technical',
                'customer_email': 'urgent@example.com',
                'priority': 'urgent'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json['data']
        assert data['sla_response_due'] is not None
        assert data['sla_resolution_due'] is not None
    
    def test_change_priority_requires_reason(self, client, agent_headers, test_ticket):
        """Test changing priority requires a reason."""
        response = client.put(
            f'/api/v1/tickets/{test_ticket.id}/priority',
            json={'priority': 'urgent'},  # Missing reason
            headers=agent_headers
        )
        
        assert response.status_code == 400
    
    def test_change_priority_with_reason(self, client, agent_headers, test_ticket):
        """Test changing priority with valid reason."""
        response = client.put(
            f'/api/v1/tickets/{test_ticket.id}/priority',
            json={
                'priority': 'urgent',
                'reason': 'Customer is VIP and issue is critical'
            },
            headers=agent_headers
        )
        
        assert response.status_code == 200
        assert response.json['data']['priority'] == 'urgent'


class TestRoleBasedAccess:
    """Tests for FR-032, FR-033: Role-based access control."""
    
    def test_customer_sees_only_own_tickets(self, client, auth_headers, test_ticket, other_user_ticket):
        """Test customer can only see their own tickets."""
        response = client.get('/api/v1/tickets', headers=auth_headers)
        
        assert response.status_code == 200
        ticket_ids = [t['id'] for t in response.json['data']['tickets']]
        assert test_ticket.id in ticket_ids
        assert other_user_ticket.id not in ticket_ids
    
    def test_agent_sees_assigned_and_unassigned(self, client, agent_headers, test_ticket, assigned_ticket):
        """Test agent sees assigned tickets and unassigned queue."""
        response = client.get('/api/v1/tickets', headers=agent_headers)
        
        assert response.status_code == 200
        # Agent should see their assigned tickets and unassigned ones
        assert len(response.json['data']['tickets']) >= 1
    
    def test_admin_sees_all_tickets(self, client, admin_headers, test_ticket, other_user_ticket):
        """Test admin can see all tickets."""
        response = client.get('/api/v1/tickets', headers=admin_headers)
        
        assert response.status_code == 200
        ticket_ids = [t['id'] for t in response.json['data']['tickets']]
        assert test_ticket.id in ticket_ids
        assert other_user_ticket.id in ticket_ids
    
    def test_customer_cannot_delete_ticket(self, client, auth_headers, test_ticket):
        """Test customer cannot delete tickets."""
        response = client.delete(
            f'/api/v1/tickets/{test_ticket.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_admin_can_delete_ticket(self, client, admin_headers, test_ticket):
        """Test admin can delete tickets."""
        response = client.delete(
            f'/api/v1/tickets/{test_ticket.id}',
            headers=admin_headers
        )
        
        assert response.status_code == 204


class TestTicketHistory:
    """Tests for ticket history/audit log."""
    
    def test_ticket_history_on_create(self, client, auth_headers, app):
        """Test history entry created when ticket is created."""
        response = client.post(
            '/api/v1/tickets',
            json={
                'subject': 'Test ticket for history',
                'description': 'This is a test to verify history entry on creation.',
                'category': 'general',
                'customer_email': 'test@example.com'
            },
            headers=auth_headers
        )
        
        assert response.status_code == 201
        ticket_id = response.json['data']['id']
        
        # Check history
        history_response = client.get(
            f'/api/v1/tickets/{ticket_id}/history',
            headers=auth_headers
        )
        
        assert history_response.status_code == 200
        history = history_response.json['data']['history']
        assert len(history) >= 1
        assert any(h['action'] == 'created' for h in history)
    
    def test_ticket_history_on_status_change(self, client, agent_headers, assigned_ticket):
        """Test history entry created when status changes."""
        # Change status
        client.put(
            f'/api/v1/tickets/{assigned_ticket.id}/status',
            json={'status': 'in_progress'},
            headers=agent_headers
        )
        
        # Check history
        response = client.get(
            f'/api/v1/tickets/{assigned_ticket.id}/history',
            headers=agent_headers
        )
        
        assert response.status_code == 200
        history = response.json['data']['history']
        assert any(h['action'] == 'status_changed' for h in history)


class TestSearchAndFilter:
    """Tests for FR-025, FR-026: Search and filtering."""
    
    def test_search_by_ticket_number(self, client, admin_headers, test_ticket):
        """Test searching by ticket number."""
        ticket_number = test_ticket.ticket_number
        
        response = client.get(
            f'/api/v1/tickets?ticket_number={ticket_number}',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        assert len(response.json['data']['tickets']) >= 1
    
    def test_filter_by_status(self, client, admin_headers, test_ticket):
        """Test filtering by status."""
        response = client.get(
            '/api/v1/tickets?status=open',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        for ticket in response.json['data']['tickets']:
            assert ticket['status'] == 'open'
    
    def test_filter_by_priority(self, client, admin_headers):
        """Test filtering by priority."""
        response = client.get(
            '/api/v1/tickets?priority=high',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        for ticket in response.json['data']['tickets']:
            assert ticket['priority'] == 'high'
    
    def test_pagination(self, client, admin_headers, many_tickets):
        """Test pagination with per_page parameter."""
        response = client.get(
            '/api/v1/tickets?page=1&per_page=5',
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json['data']
        assert len(data['tickets']) <= 5
        assert data['page'] == 1
        assert data['per_page'] == 5



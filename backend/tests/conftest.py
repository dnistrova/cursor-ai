"""Pytest fixtures for testing."""
import pytest
from datetime import datetime
from app import create_app, db
from app.models.user import User, UserRole
from app.models.blog import BlogPost, BlogComment, Category, Tag
from app.models.ticket import Ticket, TicketStatus, TicketPriority, TicketComment


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def _db(app):
    """Provide database session for each test."""
    with app.app_context():
        db.create_all()
        yield db
        db.session.rollback()
        # Clean up all data
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()


@pytest.fixture
def client(app, _db):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def test_user(app, _db):
    """Create a test user."""
    with app.app_context():
        user = User(
            email='test@example.com',
            username='testuser',
            first_name='Test',
            last_name='User',
            role='customer'
        )
        user.set_password('TestPassword123')
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user


@pytest.fixture
def admin_user(app, _db):
    """Create an admin user."""
    with app.app_context():
        user = User(
            email='admin@example.com',
            username='adminuser',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        user.set_password('AdminPassword123')
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post('/api/v1/auth/login', json={
        'email': test_user.email,
        'password': 'TestPassword123'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def admin_headers(client, admin_user):
    """Get authentication headers for admin user."""
    response = client.post('/api/v1/auth/login', json={
        'email': admin_user.email,
        'password': 'AdminPassword123'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def category(app, _db):
    """Create a test category."""
    with app.app_context():
        cat = Category(
            name='Technology',
            slug='technology',
            description='Tech posts'
        )
        db.session.add(cat)
        db.session.commit()
        db.session.refresh(cat)
        return cat


@pytest.fixture
def categories(app, _db):
    """Create multiple test categories."""
    with app.app_context():
        cats = [
            Category(name='Technology', slug='technology'),
            Category(name='Lifestyle', slug='lifestyle'),
            Category(name='Travel', slug='travel'),
        ]
        db.session.add_all(cats)
        db.session.commit()
        return cats


@pytest.fixture
def published_post(app, _db, category):
    """Create a published blog post."""
    with app.app_context():
        # Create author
        author = User(
            email='author@example.com',
            username='author',
            first_name='Post',
            last_name='Author'
        )
        author.set_password('AuthorPass123')
        db.session.add(author)
        db.session.flush()
        
        post = BlogPost(
            title='Test Published Post',
            slug='test-published-post',
            content='This is test content for the published post. It needs to be long enough.',
            excerpt='Test excerpt',
            status='published',
            published_at=datetime.utcnow(),
            author_id=author.id,
            category_id=category.id
        )
        db.session.add(post)
        db.session.commit()
        db.session.refresh(post)
        return post


@pytest.fixture
def draft_post(app, _db, test_user, category):
    """Create a draft blog post."""
    with app.app_context():
        post = BlogPost(
            title='Test Draft Post',
            slug='test-draft-post',
            content='This is draft content for testing purposes. It needs to be long enough.',
            status='draft',
            author_id=test_user.id,
            category_id=category.id
        )
        db.session.add(post)
        db.session.commit()
        db.session.refresh(post)
        return post


@pytest.fixture
def user_post(app, _db, test_user, category):
    """Create a post owned by test_user."""
    with app.app_context():
        post = BlogPost(
            title='User Own Post Title',
            slug='user-own-post',
            content='This is content for the user own post. It is long enough for validation.',
            status='draft',
            author_id=test_user.id,
            category_id=category.id
        )
        db.session.add(post)
        db.session.commit()
        db.session.refresh(post)
        return post


@pytest.fixture
def published_posts(app, _db, category):
    """Create multiple published posts."""
    with app.app_context():
        author = User(
            email='multi@example.com',
            username='multiauthor',
            first_name='Multi',
            last_name='Author'
        )
        author.set_password('MultiPass123')
        db.session.add(author)
        db.session.flush()
        
        posts = []
        for i in range(3):
            post = BlogPost(
                title=f'Test Post Number {i+1}',
                slug=f'test-post-{i+1}',
                content=f'Content for test post {i+1}. This needs to be long enough for validation to pass.',
                status='published',
                published_at=datetime.utcnow(),
                author_id=author.id,
                category_id=category.id
            )
            posts.append(post)
        
        db.session.add_all(posts)
        db.session.commit()
        return posts


@pytest.fixture
def many_posts(app, _db, category):
    """Create many posts for pagination testing."""
    with app.app_context():
        author = User(
            email='many@example.com',
            username='manyauthor',
            first_name='Many',
            last_name='Author'
        )
        author.set_password('ManyPass123')
        db.session.add(author)
        db.session.flush()
        
        posts = []
        for i in range(25):
            post = BlogPost(
                title=f'Pagination Test Post {i+1}',
                slug=f'pagination-post-{i+1}',
                content=f'Content for pagination test post {i+1}. Long enough for validation.',
                status='published',
                published_at=datetime.utcnow(),
                author_id=author.id,
                category_id=category.id
            )
            posts.append(post)
        
        db.session.add_all(posts)
        db.session.commit()
        return posts


@pytest.fixture
def comments(app, _db, published_post, test_user):
    """Create comments on a post."""
    with app.app_context():
        comments = []
        for i in range(3):
            comment = BlogComment(
                content=f'This is test comment number {i+1}',
                status='approved',
                post_id=published_post.id,
                author_id=test_user.id
            )
            comments.append(comment)
        
        db.session.add_all(comments)
        db.session.commit()
        return comments


@pytest.fixture
def user_comment(app, _db, published_post, test_user):
    """Create a comment owned by test_user."""
    with app.app_context():
        comment = BlogComment(
            content='This is my own comment for testing deletion',
            status='approved',
            post_id=published_post.id,
            author_id=test_user.id
        )
        db.session.add(comment)
        db.session.commit()
        db.session.refresh(comment)
        return comment


# ============================================================================
# Ticket System Fixtures
# ============================================================================

@pytest.fixture
def agent_user(app, _db):
    """Create an agent user."""
    with app.app_context():
        user = User(
            email='agent@example.com',
            username='agentuser',
            first_name='Support',
            last_name='Agent',
            role=UserRole.AGENT,
            availability_status='available'
        )
        user.set_password('AgentPassword123')
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user


@pytest.fixture
def agent_headers(client, agent_user):
    """Get authentication headers for agent user."""
    response = client.post('/api/v1/auth/login', json={
        'email': agent_user.email,
        'password': 'AgentPassword123'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def test_ticket(app, _db, test_user):
    """Create a test ticket."""
    with app.app_context():
        ticket = Ticket(
            ticket_number=Ticket.generate_ticket_number(),
            subject='Test support ticket',
            description='This is a detailed description of the test support ticket for testing purposes.',
            status=TicketStatus.OPEN,
            priority=TicketPriority.MEDIUM,
            category='technical',
            customer_email=test_user.email,
            customer_id=test_user.id
        )
        ticket.calculate_sla_deadlines()
        db.session.add(ticket)
        db.session.commit()
        db.session.refresh(ticket)
        return ticket


@pytest.fixture
def assigned_ticket(app, _db, test_user, agent_user):
    """Create an assigned ticket."""
    with app.app_context():
        ticket = Ticket(
            ticket_number=Ticket.generate_ticket_number(),
            subject='Assigned support ticket',
            description='This is an assigned ticket for testing status transitions and agent access.',
            status=TicketStatus.ASSIGNED,
            priority=TicketPriority.HIGH,
            category='technical',
            customer_email=test_user.email,
            customer_id=test_user.id,
            assigned_to_id=agent_user.id
        )
        ticket.calculate_sla_deadlines()
        db.session.add(ticket)
        db.session.commit()
        db.session.refresh(ticket)
        return ticket


@pytest.fixture
def in_progress_ticket(app, _db, test_user, agent_user):
    """Create an in-progress ticket."""
    with app.app_context():
        ticket = Ticket(
            ticket_number=Ticket.generate_ticket_number(),
            subject='In progress support ticket',
            description='This ticket is being actively worked on by the support team.',
            status=TicketStatus.IN_PROGRESS,
            priority=TicketPriority.HIGH,
            category='billing',
            customer_email=test_user.email,
            customer_id=test_user.id,
            assigned_to_id=agent_user.id
        )
        ticket.calculate_sla_deadlines()
        db.session.add(ticket)
        db.session.commit()
        db.session.refresh(ticket)
        return ticket


@pytest.fixture
def resolved_ticket(app, _db, test_user, agent_user):
    """Create a resolved ticket."""
    with app.app_context():
        ticket = Ticket(
            ticket_number=Ticket.generate_ticket_number(),
            subject='Resolved support ticket',
            description='This ticket has been resolved and is awaiting customer confirmation.',
            status=TicketStatus.RESOLVED,
            priority=TicketPriority.MEDIUM,
            category='general',
            customer_email=test_user.email,
            customer_id=test_user.id,
            assigned_to_id=agent_user.id,
            resolved_at=datetime.utcnow()
        )
        ticket.calculate_sla_deadlines()
        db.session.add(ticket)
        db.session.commit()
        db.session.refresh(ticket)
        return ticket


@pytest.fixture
def other_user(app, _db):
    """Create another user for access control testing."""
    with app.app_context():
        user = User(
            email='other@example.com',
            username='otheruser',
            first_name='Other',
            last_name='User',
            role='customer'
        )
        user.set_password('OtherPassword123')
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user


@pytest.fixture
def other_user_ticket(app, _db, other_user):
    """Create a ticket owned by another user."""
    with app.app_context():
        ticket = Ticket(
            ticket_number=Ticket.generate_ticket_number(),
            subject='Other user ticket',
            description='This ticket belongs to another user for access control testing.',
            status=TicketStatus.OPEN,
            priority=TicketPriority.LOW,
            category='general',
            customer_email=other_user.email,
            customer_id=other_user.id
        )
        ticket.calculate_sla_deadlines()
        db.session.add(ticket)
        db.session.commit()
        db.session.refresh(ticket)
        return ticket


@pytest.fixture
def ticket_with_internal_comment(app, _db, test_user, agent_user):
    """Create a ticket with an internal comment."""
    with app.app_context():
        ticket = Ticket(
            ticket_number=Ticket.generate_ticket_number(),
            subject='Ticket with internal comment',
            description='This ticket has internal notes from the support team.',
            status=TicketStatus.IN_PROGRESS,
            priority=TicketPriority.MEDIUM,
            category='technical',
            customer_email=test_user.email,
            customer_id=test_user.id,
            assigned_to_id=agent_user.id
        )
        ticket.calculate_sla_deadlines()
        db.session.add(ticket)
        db.session.flush()
        
        # Add internal comment
        comment = TicketComment(
            content='This is an internal note not visible to customer.',
            is_internal=True,
            ticket_id=ticket.id,
            user_id=agent_user.id
        )
        db.session.add(comment)
        db.session.commit()
        db.session.refresh(ticket)
        return ticket


@pytest.fixture
def many_tickets(app, _db, test_user):
    """Create many tickets for pagination testing."""
    with app.app_context():
        tickets = []
        for i in range(25):
            ticket = Ticket(
                ticket_number=Ticket.generate_ticket_number(),
                subject=f'Pagination test ticket {i+1}',
                description=f'This is test ticket number {i+1} for pagination testing purposes.',
                status=TicketStatus.OPEN,
                priority=TicketPriority.MEDIUM,
                category='general',
                customer_email=test_user.email,
                customer_id=test_user.id
            )
            ticket.calculate_sla_deadlines()
            db.session.add(ticket)
            db.session.flush()  # Flush after each to ensure unique ticket numbers
            tickets.append(ticket)
        
        db.session.commit()
        return tickets

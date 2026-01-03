"""User model."""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class UserRole:
    """User role constants."""
    CUSTOMER = 'customer'
    AGENT = 'agent'
    ADMIN = 'admin'
    
    ALL = [CUSTOMER, AGENT, ADMIN]


class AvailabilityStatus:
    """Agent availability status constants."""
    AVAILABLE = 'available'
    BUSY = 'busy'
    OFFLINE = 'offline'
    
    ALL = [AVAILABLE, BUSY, OFFLINE]


class User(db.Model):
    """User model for authentication and authorization."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # Role-based access control
    role = db.Column(db.String(20), default=UserRole.CUSTOMER, index=True)
    
    # Agent-specific fields
    availability_status = db.Column(db.String(20), default=AvailabilityStatus.OFFLINE)
    expertise_areas = db.Column(db.JSON, default=list)  # ['technical', 'billing', etc.]
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Note: Ticket relationships are defined in ticket.py with backrefs to User
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Hash and set the user password."""
        # Use pbkdf2:sha256 for Python 3.9 compatibility (scrypt not available)
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """Check if the provided password matches the hash."""
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        """Return the user's full name."""
        if self.first_name and self.last_name:
            return f'{self.first_name} {self.last_name}'
        return self.username
    
    @property
    def is_admin(self):
        """Check if user is admin."""
        return self.role == UserRole.ADMIN
    
    @property
    def is_agent(self):
        """Check if user is agent."""
        return self.role == UserRole.AGENT
    
    @property
    def is_customer(self):
        """Check if user is customer."""
        return self.role == UserRole.CUSTOMER
    
    @property
    def open_ticket_count(self):
        """Get count of open tickets assigned to agent."""
        if not self.is_agent:
            return 0
        from app.models.ticket import Ticket, TicketStatus
        return Ticket.query.filter(
            Ticket.assigned_to_id == self.id,
            Ticket.status.notin_([TicketStatus.CLOSED, TicketStatus.RESOLVED])
        ).count()
    
    def can_access_ticket(self, ticket):
        """Check if user can access a ticket."""
        if self.is_admin:
            return True
        if self.is_agent:
            return ticket.assigned_to_id == self.id or ticket.assigned_to_id is None
        # Customer can only see their own tickets
        return ticket.customer_id == self.id
    
    def to_dict(self, include_agent_info=False):
        """Convert user to dictionary."""
        data = {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'avatar_url': self.avatar_url,
            'is_active': self.is_active,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }
        
        if include_agent_info and self.is_agent:
            data['availability_status'] = self.availability_status
            data['expertise_areas'] = self.expertise_areas
            data['open_ticket_count'] = self.open_ticket_count
        
        return data



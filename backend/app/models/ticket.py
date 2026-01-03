"""Ticket model for customer support system."""
from datetime import datetime, timedelta
from app import db


class TicketStatus:
    """Ticket status constants."""
    OPEN = 'open'
    ASSIGNED = 'assigned'
    IN_PROGRESS = 'in_progress'
    WAITING = 'waiting'
    RESOLVED = 'resolved'
    CLOSED = 'closed'
    REOPENED = 'reopened'
    
    ALL = [OPEN, ASSIGNED, IN_PROGRESS, WAITING, RESOLVED, CLOSED, REOPENED]
    
    # Valid transitions: current_status -> [allowed_next_statuses]
    TRANSITIONS = {
        OPEN: [ASSIGNED, CLOSED],
        ASSIGNED: [IN_PROGRESS, CLOSED],
        IN_PROGRESS: [WAITING, RESOLVED, CLOSED],
        WAITING: [IN_PROGRESS],
        RESOLVED: [CLOSED, REOPENED],
        CLOSED: [REOPENED],  # Only within 7 days
        REOPENED: [IN_PROGRESS],
    }


class TicketPriority:
    """Ticket priority constants with SLA times."""
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    URGENT = 'urgent'
    
    ALL = [LOW, MEDIUM, HIGH, URGENT]
    
    # SLA times in hours: (first_response, resolution)
    SLA = {
        URGENT: (2, 24),
        HIGH: (4, 48),
        MEDIUM: (8, 120),  # 5 days
        LOW: (24, 240),    # 10 days
    }


class TicketCategory:
    """Ticket category constants."""
    TECHNICAL = 'technical'
    BILLING = 'billing'
    GENERAL = 'general'
    FEATURE_REQUEST = 'feature_request'
    
    ALL = [TECHNICAL, BILLING, GENERAL, FEATURE_REQUEST]


class Ticket(db.Model):
    """Customer support ticket model."""
    
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default=TicketStatus.OPEN, index=True)
    priority = db.Column(db.String(20), default=TicketPriority.MEDIUM, index=True)
    category = db.Column(db.String(50), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False, index=True)
    
    # SLA tracking
    first_response_at = db.Column(db.DateTime, nullable=True)
    sla_response_due = db.Column(db.DateTime, nullable=True)
    sla_resolution_due = db.Column(db.DateTime, nullable=True)
    sla_breached = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    closed_at = db.Column(db.DateTime, nullable=True)
    
    # Foreign keys
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    customer = db.relationship('User', foreign_keys=[customer_id], backref='submitted_tickets')
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='assigned_tickets')
    ticket_comments = db.relationship('TicketComment', backref='ticket', lazy='dynamic', cascade='all, delete-orphan')
    attachments = db.relationship('TicketAttachment', backref='ticket', lazy='dynamic', cascade='all, delete-orphan')
    history = db.relationship('TicketHistory', backref='ticket', lazy='dynamic', cascade='all, delete-orphan')
    assignments = db.relationship('TicketAssignment', backref='ticket', lazy='dynamic', cascade='all, delete-orphan')
    
    # Indexes
    __table_args__ = (
        db.Index('idx_ticket_status_priority', 'status', 'priority'),
        db.Index('idx_ticket_customer', 'customer_id'),
        db.Index('idx_ticket_agent', 'assigned_to_id'),
        db.Index('idx_ticket_created', 'created_at'),
    )
    
    def __repr__(self):
        return f'<Ticket {self.ticket_number}>'
    
    @staticmethod
    def generate_ticket_number():
        """Generate unique ticket number: TICK-YYYYMMDD-XXXX."""
        today = datetime.utcnow().strftime('%Y%m%d')
        prefix = f'TICK-{today}-'
        
        # Get the last ticket number for today
        last_ticket = Ticket.query.filter(
            Ticket.ticket_number.like(f'{prefix}%')
        ).order_by(Ticket.id.desc()).first()
        
        if last_ticket:
            last_num = int(last_ticket.ticket_number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f'{prefix}{new_num:04d}'
    
    def calculate_sla_deadlines(self):
        """Calculate SLA deadlines based on priority."""
        if self.priority in TicketPriority.SLA:
            response_hours, resolution_hours = TicketPriority.SLA[self.priority]
            # Use current time if created_at not yet set (before db commit)
            base_time = self.created_at or datetime.utcnow()
            self.sla_response_due = base_time + timedelta(hours=response_hours)
            self.sla_resolution_due = base_time + timedelta(hours=resolution_hours)
    
    def can_transition_to(self, new_status):
        """Check if transition to new status is valid."""
        if self.status == TicketStatus.CLOSED and new_status == TicketStatus.REOPENED:
            # Can only reopen within 7 days
            if self.closed_at:
                days_since_closed = (datetime.utcnow() - self.closed_at).days
                return days_since_closed <= 7
            return False
        
        return new_status in TicketStatus.TRANSITIONS.get(self.status, [])
    
    def transition_to(self, new_status):
        """Transition ticket to new status."""
        if not self.can_transition_to(new_status):
            return False
        
        old_status = self.status
        self.status = new_status
        
        # Update relevant timestamps
        if new_status == TicketStatus.RESOLVED:
            self.resolved_at = datetime.utcnow()
        elif new_status == TicketStatus.CLOSED:
            self.closed_at = datetime.utcnow()
        elif new_status == TicketStatus.REOPENED:
            self.resolved_at = None
            self.closed_at = None
        
        return True
    
    def record_first_response(self):
        """Record first response time."""
        if not self.first_response_at:
            self.first_response_at = datetime.utcnow()
    
    @property
    def is_sla_response_breached(self):
        """Check if response SLA is breached."""
        if self.first_response_at:
            return False
        if self.sla_response_due:
            return datetime.utcnow() > self.sla_response_due
        return False
    
    @property
    def is_sla_resolution_breached(self):
        """Check if resolution SLA is breached."""
        if self.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            return False
        if self.sla_resolution_due:
            return datetime.utcnow() > self.sla_resolution_due
        return False
    
    @property
    def time_to_sla_response(self):
        """Get time remaining until response SLA breach (in minutes)."""
        if self.first_response_at or not self.sla_response_due:
            return None
        delta = self.sla_response_due - datetime.utcnow()
        return int(delta.total_seconds() / 60)
    
    @property
    def time_to_sla_resolution(self):
        """Get time remaining until resolution SLA breach (in minutes)."""
        if self.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            return None
        if not self.sla_resolution_due:
            return None
        delta = self.sla_resolution_due - datetime.utcnow()
        return int(delta.total_seconds() / 60)
    
    def to_dict(self, include_comments=False):
        """Convert ticket to dictionary."""
        data = {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'subject': self.subject,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'category': self.category,
            'customer_email': self.customer_email,
            'customer_id': self.customer_id,
            'assigned_to_id': self.assigned_to_id,
            'first_response_at': self.first_response_at.isoformat() if self.first_response_at else None,
            'sla_response_due': self.sla_response_due.isoformat() if self.sla_response_due else None,
            'sla_resolution_due': self.sla_resolution_due.isoformat() if self.sla_resolution_due else None,
            'sla_breached': self.sla_breached,
            'is_sla_response_breached': self.is_sla_response_breached,
            'is_sla_resolution_breached': self.is_sla_resolution_breached,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'closed_at': self.closed_at.isoformat() if self.closed_at else None,
            'comment_count': self.ticket_comments.count(),
            'attachment_count': self.attachments.count(),
        }
        
        if self.assigned_to:
            data['assigned_to'] = {
                'id': self.assigned_to.id,
                'name': self.assigned_to.full_name,
                'email': self.assigned_to.email,
            }
        
        if self.customer:
            data['customer'] = {
                'id': self.customer.id,
                'name': self.customer.full_name,
                'email': self.customer.email,
            }
        
        return data


class TicketComment(db.Model):
    """Comment on a support ticket."""
    
    __tablename__ = 'ticket_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_internal = db.Column(db.Boolean, default=False)  # Internal notes not visible to customer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='ticket_comments')
    comment_attachments = db.relationship('TicketAttachment', backref='comment', lazy='dynamic')
    
    def __repr__(self):
        return f'<TicketComment {self.id} on {self.ticket_id}>'
    
    def to_dict(self):
        """Convert comment to dictionary."""
        return {
            'id': self.id,
            'content': self.content,
            'is_internal': self.is_internal,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'name': self.user.full_name,
                'email': self.user.email,
                'role': self.user.role,
            } if self.user else None,
            'attachments': [a.to_dict() for a in self.comment_attachments.all()],
        }


class TicketAttachment(db.Model):
    """File attachment for ticket or comment."""
    
    __tablename__ = 'ticket_attachments'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    file_type = db.Column(db.String(50), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('ticket_comments.id'), nullable=True)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    uploaded_by = db.relationship('User', backref='uploaded_attachments')
    
    # Allowed file types
    ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
    MAX_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_FILES = 3
    
    def __repr__(self):
        return f'<TicketAttachment {self.filename}>'
    
    def to_dict(self):
        """Convert attachment to dictionary."""
        return {
            'id': self.id,
            'filename': self.filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'uploaded_by_id': self.uploaded_by_id,
        }


class TicketHistory(db.Model):
    """History/audit log for ticket changes."""
    
    __tablename__ = 'ticket_history'
    
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)  # created, status_changed, priority_changed, assigned, commented
    old_value = db.Column(db.String(200), nullable=True)
    new_value = db.Column(db.String(200), nullable=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='ticket_history_entries')
    
    def __repr__(self):
        return f'<TicketHistory {self.action} on {self.ticket_id}>'
    
    def to_dict(self):
        """Convert history entry to dictionary."""
        return {
            'id': self.id,
            'action': self.action,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': {
                'id': self.user.id,
                'name': self.user.full_name,
            } if self.user else None,
        }


class TicketAssignment(db.Model):
    """Assignment history for tickets."""
    
    __tablename__ = 'ticket_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id])
    assigned_by = db.relationship('User', foreign_keys=[assigned_by_id])
    
    def __repr__(self):
        return f'<TicketAssignment {self.ticket_id} to {self.assigned_to_id}>'
    
    def to_dict(self):
        """Convert assignment to dictionary."""
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'assigned_to': {
                'id': self.assigned_to.id,
                'name': self.assigned_to.full_name,
            } if self.assigned_to else None,
            'assigned_by': {
                'id': self.assigned_by.id,
                'name': self.assigned_by.full_name,
            } if self.assigned_by else None,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
        }



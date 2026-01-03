"""Notification model for real-time updates."""
from datetime import datetime
from app import db


class Notification(db.Model):
    """Notification model for user alerts and updates."""
    
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # task_assigned, comment, mention, due_soon, etc.
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=True)
    data = db.Column(db.JSON, nullable=True)  # Additional data (task_id, project_id, etc.)
    
    # Status
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='notifications')
    sender = db.relationship('User', foreign_keys=[sender_id])
    
    # Indexes
    __table_args__ = (
        db.Index('idx_notification_user_read', 'user_id', 'is_read'),
        db.Index('idx_notification_created', 'created_at'),
    )
    
    def __repr__(self):
        return f'<Notification {self.type} for User {self.user_id}>'
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.read_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert notification to dictionary."""
        return {
            'id': self.id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'data': self.data,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id,
            'sender_id': self.sender_id,
        }


class NotificationType:
    """Notification type constants."""
    
    TASK_ASSIGNED = 'task_assigned'
    TASK_COMPLETED = 'task_completed'
    TASK_UPDATED = 'task_updated'
    TASK_DUE_SOON = 'task_due_soon'
    TASK_OVERDUE = 'task_overdue'
    COMMENT_ADDED = 'comment_added'
    MENTION = 'mention'
    PROJECT_INVITE = 'project_invite'
    PROJECT_UPDATE = 'project_update'
    TEAM_JOIN = 'team_join'
    TEAM_LEAVE = 'team_leave'




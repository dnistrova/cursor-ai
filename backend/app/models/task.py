"""Task model for Kanban board."""
from datetime import datetime
from app import db


# Association table for task assignees
task_assignees = db.Table(
    'task_assignees',
    db.Column('task_id', db.Integer, db.ForeignKey('tasks.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('assigned_at', db.DateTime, default=datetime.utcnow)
)


# Association table for task tags
task_tags = db.Table(
    'task_tags',
    db.Column('task_id', db.Integer, db.ForeignKey('tasks.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)


class Tag(db.Model):
    """Tag model for categorizing tasks."""
    
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    color = db.Column(db.String(7), default='#6366f1')
    
    def __repr__(self):
        return f'<Tag {self.name}>'


class Task(db.Model):
    """Task model for project management."""
    
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='todo', index=True)  # todo, in-progress, done
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    
    # Time tracking
    estimated_hours = db.Column(db.Float, nullable=True)
    actual_hours = db.Column(db.Float, nullable=True)
    
    # Dates
    due_date = db.Column(db.DateTime, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Position for ordering in Kanban
    position = db.Column(db.Integer, default=0)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Creator
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)
    
    # Relationships
    assignees = db.relationship(
        'User',
        secondary=task_assignees,
        backref=db.backref('assigned_tasks', lazy='dynamic')
    )
    tags = db.relationship(
        'Tag',
        secondary=task_tags,
        backref=db.backref('tasks', lazy='dynamic')
    )
    
    # Indexes
    __table_args__ = (
        db.Index('idx_task_status_priority', 'status', 'priority'),
        db.Index('idx_task_project', 'project_id'),
        db.Index('idx_task_due_date', 'due_date'),
    )
    
    def __repr__(self):
        return f'<Task {self.title}>'
    
    def assign_user(self, user):
        """Assign a user to the task."""
        if user not in self.assignees:
            self.assignees.append(user)
    
    def unassign_user(self, user):
        """Remove user assignment from the task."""
        if user in self.assignees:
            self.assignees.remove(user)
    
    def complete(self):
        """Mark task as completed."""
        self.status = 'done'
        self.completed_at = datetime.utcnow()
    
    @property
    def is_overdue(self):
        """Check if task is overdue."""
        if self.due_date and self.status != 'done':
            return datetime.utcnow() > self.due_date
        return False
    
    def to_dict(self):
        """Convert task to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'position': self.position,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'is_overdue': self.is_overdue,
            'assignee_ids': [u.id for u in self.assignees],
            'tag_ids': [t.id for t in self.tags],
            'comment_count': self.comments.count() if hasattr(self, 'comments') else 0,
        }


"""Project model for team collaboration."""
from datetime import datetime
from app import db


# Association table for project members
project_members = db.Table(
    'project_members',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('role', db.String(20), default='member'),  # owner, admin, member
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)


class Project(db.Model):
    """Project model for organizing tasks and teams."""
    
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(7), default='#6366f1')  # Hex color
    icon = db.Column(db.String(50), default='folder')
    status = db.Column(db.String(20), default='active')  # active, archived, completed
    visibility = db.Column(db.String(20), default='private')  # private, team, public
    
    # Dates
    start_date = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    owner = db.relationship('User', backref='owned_projects', foreign_keys=[owner_id])
    members = db.relationship(
        'User',
        secondary=project_members,
        backref=db.backref('projects', lazy='dynamic')
    )
    tasks = db.relationship('Task', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Project {self.name}>'
    
    def add_member(self, user, role='member'):
        """Add a member to the project."""
        if user not in self.members:
            self.members.append(user)
    
    def remove_member(self, user):
        """Remove a member from the project."""
        if user in self.members:
            self.members.remove(user)
    
    def is_member(self, user):
        """Check if user is a member of the project."""
        return user in self.members or user.id == self.owner_id
    
    @property
    def task_count(self):
        """Get total task count."""
        return self.tasks.count()
    
    @property
    def completed_task_count(self):
        """Get completed task count."""
        return self.tasks.filter_by(status='done').count()
    
    @property
    def progress(self):
        """Calculate project progress percentage."""
        total = self.task_count
        if total == 0:
            return 0
        return int((self.completed_task_count / total) * 100)
    
    def to_dict(self):
        """Convert project to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'status': self.status,
            'visibility': self.visibility,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'owner_id': self.owner_id,
            'member_count': len(self.members),
            'task_count': self.task_count,
            'progress': self.progress,
        }




"""Database models."""
from app.models.user import User, UserRole, AvailabilityStatus
from app.models.ticket import (
    Ticket, TicketStatus, TicketPriority, TicketCategory,
    TicketComment, TicketAttachment, TicketHistory, TicketAssignment
)
from app.models.blog import BlogPost, BlogComment, Category, Tag as BlogTag
from app.models.project import Project
from app.models.task import Task, Tag as TaskTag

__all__ = [
    # User
    'User',
    'UserRole',
    'AvailabilityStatus',
    # Ticket
    'Ticket',
    'TicketStatus',
    'TicketPriority',
    'TicketCategory',
    'TicketComment',
    'TicketAttachment',
    'TicketHistory',
    'TicketAssignment',
    # Blog
    'BlogPost',
    'BlogComment',
    'Category',
    'BlogTag',
    # Project & Task
    'Project',
    'Task',
    'TaskTag',
]


"""Notification service for creating and managing notifications."""
from app import db
from app.models import Notification, NotificationType, User, Task


class NotificationService:
    """Service for creating notifications."""
    
    @staticmethod
    def create(type: str, title: str, user_id: int, message: str = None,
               data: dict = None, sender_id: int = None) -> Notification:
        """Create a new notification.
        
        Args:
            type: Notification type (from NotificationType)
            title: Notification title
            user_id: Recipient user ID
            message: Optional message body
            data: Optional additional data
            sender_id: Optional sender user ID
            
        Returns:
            Created Notification instance
        """
        notification = Notification(
            type=type,
            title=title,
            message=message,
            data=data,
            user_id=user_id,
            sender_id=sender_id
        )
        db.session.add(notification)
        return notification
    
    @staticmethod
    def notify_task_assigned(task: Task, assignee: User, assigner: User) -> Notification:
        """Notify user they've been assigned to a task."""
        return NotificationService.create(
            type=NotificationType.TASK_ASSIGNED,
            title='New task assigned',
            message=f'You have been assigned to "{task.title}"',
            user_id=assignee.id,
            sender_id=assigner.id,
            data={'task_id': task.id, 'project_id': task.project_id}
        )
    
    @staticmethod
    def notify_task_completed(task: Task, completer: User) -> list:
        """Notify relevant users when a task is completed."""
        notifications = []
        
        # Notify task creator if different from completer
        if task.user_id != completer.id:
            notifications.append(NotificationService.create(
                type=NotificationType.TASK_COMPLETED,
                title='Task completed',
                message=f'"{task.title}" has been marked as done',
                user_id=task.user_id,
                sender_id=completer.id,
                data={'task_id': task.id}
            ))
        
        # Notify other assignees
        for assignee in task.assignees:
            if assignee.id != completer.id:
                notifications.append(NotificationService.create(
                    type=NotificationType.TASK_COMPLETED,
                    title='Task completed',
                    message=f'"{task.title}" has been marked as done',
                    user_id=assignee.id,
                    sender_id=completer.id,
                    data={'task_id': task.id}
                ))
        
        return notifications
    
    @staticmethod
    def notify_project_invite(project, invitee: User, inviter: User) -> Notification:
        """Notify user they've been invited to a project."""
        return NotificationService.create(
            type=NotificationType.PROJECT_INVITE,
            title='Project invitation',
            message=f'You have been invited to join "{project.name}"',
            user_id=invitee.id,
            sender_id=inviter.id,
            data={'project_id': project.id}
        )
    
    @staticmethod
    def notify_mention(task: Task, mentioned_user: User, mentioner: User) -> Notification:
        """Notify user they've been mentioned."""
        return NotificationService.create(
            type=NotificationType.MENTION,
            title='You were mentioned',
            message=f'You were mentioned in "{task.title}"',
            user_id=mentioned_user.id,
            sender_id=mentioner.id,
            data={'task_id': task.id}
        )
    
    @staticmethod
    def notify_due_soon(task: Task) -> list:
        """Notify assignees of upcoming due date."""
        notifications = []
        
        for assignee in task.assignees:
            notifications.append(NotificationService.create(
                type=NotificationType.TASK_DUE_SOON,
                title='Task due soon',
                message=f'"{task.title}" is due soon',
                user_id=assignee.id,
                data={'task_id': task.id, 'due_date': task.due_date.isoformat()}
            ))
        
        return notifications
    
    @staticmethod
    def get_unread_count(user_id: int) -> int:
        """Get unread notification count for a user."""
        return Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).count()




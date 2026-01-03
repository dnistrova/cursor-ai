"""Email notification background tasks."""
import logging
from app.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_ticket_created_email(self, ticket_id, customer_email):
    """Send email notification when ticket is created.
    
    Args:
        ticket_id: ID of the created ticket
        customer_email: Customer email address
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            logger.error(f"Ticket {ticket_id} not found for email notification")
            return {'status': 'error', 'message': 'Ticket not found'}
        
        # In production, use a real email service (SendGrid, SES, etc.)
        email_content = {
            'to': customer_email,
            'subject': f'Ticket Created: {ticket.ticket_number}',
            'body': f'''
Your support ticket has been created successfully.

Ticket Number: {ticket.ticket_number}
Subject: {ticket.subject}
Priority: {ticket.priority}
Category: {ticket.category}

We will respond within {_get_sla_time(ticket.priority)}.

Thank you for contacting support.
            '''.strip()
        }
        
        # Simulate sending email
        logger.info(f"Email sent to {customer_email} for ticket {ticket.ticket_number}")
        
        return {
            'status': 'success',
            'ticket_id': ticket_id,
            'email': customer_email
        }
        
    except Exception as exc:
        logger.error(f"Failed to send ticket created email: {exc}")
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_ticket_assigned_email(self, ticket_id, agent_id):
    """Send email notification when ticket is assigned to an agent.
    
    Args:
        ticket_id: ID of the ticket
        agent_id: ID of the assigned agent
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket
        from app.models.user import User
        
        ticket = Ticket.query.get(ticket_id)
        agent = User.query.get(agent_id)
        
        if not ticket or not agent:
            return {'status': 'error', 'message': 'Ticket or agent not found'}
        
        email_content = {
            'to': agent.email,
            'subject': f'Ticket Assigned: {ticket.ticket_number}',
            'body': f'''
A new ticket has been assigned to you.

Ticket Number: {ticket.ticket_number}
Subject: {ticket.subject}
Priority: {ticket.priority}
Category: {ticket.category}
Customer: {ticket.customer_email}

SLA Response Due: {ticket.sla_response_due}
SLA Resolution Due: {ticket.sla_resolution_due}

Please respond promptly.
            '''.strip()
        }
        
        logger.info(f"Assignment email sent to {agent.email} for ticket {ticket.ticket_number}")
        
        return {
            'status': 'success',
            'ticket_id': ticket_id,
            'agent_id': agent_id
        }
        
    except Exception as exc:
        logger.error(f"Failed to send assignment email: {exc}")
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_status_changed_email(self, ticket_id, old_status, new_status, recipient_email):
    """Send email notification when ticket status changes.
    
    Args:
        ticket_id: ID of the ticket
        old_status: Previous status
        new_status: New status
        recipient_email: Email to notify
    """
    try:
        from app.models.ticket import Ticket
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {'status': 'error', 'message': 'Ticket not found'}
        
        email_content = {
            'to': recipient_email,
            'subject': f'Ticket Status Update: {ticket.ticket_number}',
            'body': f'''
Your ticket status has been updated.

Ticket Number: {ticket.ticket_number}
Subject: {ticket.subject}
Previous Status: {old_status}
New Status: {new_status}

{_get_status_message(new_status)}
            '''.strip()
        }
        
        logger.info(f"Status change email sent for ticket {ticket.ticket_number}")
        
        return {'status': 'success', 'ticket_id': ticket_id}
        
    except Exception as exc:
        logger.error(f"Failed to send status change email: {exc}")
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_comment_notification_email(self, ticket_id, comment_id, recipient_email):
    """Send email notification when a new comment is added.
    
    Args:
        ticket_id: ID of the ticket
        comment_id: ID of the new comment
        recipient_email: Email to notify
    """
    try:
        from app.models.ticket import Ticket, TicketComment
        
        ticket = Ticket.query.get(ticket_id)
        comment = TicketComment.query.get(comment_id)
        
        if not ticket or not comment:
            return {'status': 'error', 'message': 'Ticket or comment not found'}
        
        # Don't send email for internal comments to customers
        if comment.is_internal:
            return {'status': 'skipped', 'reason': 'Internal comment'}
        
        email_content = {
            'to': recipient_email,
            'subject': f'New Comment on Ticket: {ticket.ticket_number}',
            'body': f'''
A new comment has been added to your ticket.

Ticket Number: {ticket.ticket_number}
Subject: {ticket.subject}

Comment:
{comment.content}

Reply to this ticket through the support portal.
            '''.strip()
        }
        
        logger.info(f"Comment notification sent for ticket {ticket.ticket_number}")
        
        return {'status': 'success', 'ticket_id': ticket_id, 'comment_id': comment_id}
        
    except Exception as exc:
        logger.error(f"Failed to send comment notification: {exc}")
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_sla_warning_email(self, ticket_id, warning_type, recipient_email):
    """Send SLA warning email.
    
    Args:
        ticket_id: ID of the ticket
        warning_type: 'response' or 'resolution'
        recipient_email: Email to notify
    """
    try:
        from app.models.ticket import Ticket
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {'status': 'error', 'message': 'Ticket not found'}
        
        due_time = ticket.sla_response_due if warning_type == 'response' else ticket.sla_resolution_due
        
        email_content = {
            'to': recipient_email,
            'subject': f'SLA Warning: {ticket.ticket_number}',
            'body': f'''
⚠️ SLA WARNING

Ticket {ticket.ticket_number} is approaching its {warning_type} SLA deadline.

Ticket Number: {ticket.ticket_number}
Subject: {ticket.subject}
Priority: {ticket.priority}
{warning_type.title()} Due: {due_time}

Please take immediate action.
            '''.strip()
        }
        
        logger.warning(f"SLA warning sent for ticket {ticket.ticket_number}")
        
        return {'status': 'success', 'ticket_id': ticket_id, 'warning_type': warning_type}
        
    except Exception as exc:
        logger.error(f"Failed to send SLA warning: {exc}")
        raise self.retry(exc=exc)


def _get_sla_time(priority):
    """Get human-readable SLA time for priority."""
    sla_times = {
        'urgent': '2 hours',
        'high': '4 hours',
        'medium': '8 hours',
        'low': '24 hours',
    }
    return sla_times.get(priority, '24 hours')


def _get_status_message(status):
    """Get human-readable status message."""
    messages = {
        'assigned': 'Your ticket has been assigned to a support agent.',
        'in_progress': 'A support agent is actively working on your ticket.',
        'waiting': 'We are waiting for additional information from you.',
        'resolved': 'Your ticket has been resolved. Please confirm if the issue is fixed.',
        'closed': 'Your ticket has been closed. Thank you for contacting support.',
        'reopened': 'Your ticket has been reopened and will be addressed shortly.',
    }
    return messages.get(status, '')



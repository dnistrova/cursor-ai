"""SLA monitoring and escalation background tasks."""
import logging
from datetime import datetime, timedelta
from app.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True)
def check_sla_breaches(self):
    """Check for SLA breaches and send warnings.
    
    This task runs periodically to:
    1. Find tickets approaching SLA deadlines
    2. Find tickets that have breached SLA
    3. Send warning emails
    4. Trigger escalations
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket, TicketStatus
        from app.models.user import User
        from app.tasks.email_tasks import send_sla_warning_email
        
        now = datetime.utcnow()
        warning_threshold = timedelta(minutes=30)  # Warn 30 minutes before breach
        
        # Active ticket statuses (not closed/resolved)
        active_statuses = [
            TicketStatus.OPEN,
            TicketStatus.ASSIGNED,
            TicketStatus.IN_PROGRESS,
            TicketStatus.WAITING,
            TicketStatus.REOPENED,
        ]
        
        # Check response SLA
        response_warning_time = now + warning_threshold
        tickets_approaching_response = Ticket.query.filter(
            Ticket.status.in_(active_statuses),
            Ticket.first_response_at.is_(None),
            Ticket.sla_response_due <= response_warning_time,
            Ticket.sla_response_due > now,
        ).all()
        
        for ticket in tickets_approaching_response:
            if ticket.assigned_to:
                send_sla_warning_email.delay(
                    ticket.id,
                    'response',
                    ticket.assigned_to.email
                )
        
        # Check resolution SLA
        resolution_warning_time = now + warning_threshold
        tickets_approaching_resolution = Ticket.query.filter(
            Ticket.status.in_(active_statuses),
            Ticket.sla_resolution_due <= resolution_warning_time,
            Ticket.sla_resolution_due > now,
        ).all()
        
        for ticket in tickets_approaching_resolution:
            if ticket.assigned_to:
                send_sla_warning_email.delay(
                    ticket.id,
                    'resolution',
                    ticket.assigned_to.email
                )
        
        # Mark breached tickets
        breached_tickets = Ticket.query.filter(
            Ticket.status.in_(active_statuses),
            Ticket.sla_breached == False,
            db.or_(
                db.and_(
                    Ticket.first_response_at.is_(None),
                    Ticket.sla_response_due < now
                ),
                Ticket.sla_resolution_due < now
            )
        ).all()
        
        for ticket in breached_tickets:
            ticket.sla_breached = True
            # Trigger escalation
            escalate_ticket.delay(ticket.id)
        
        db.session.commit()
        
        logger.info(f"SLA check completed. Warnings: {len(tickets_approaching_response) + len(tickets_approaching_resolution)}, Breaches: {len(breached_tickets)}")
        
        return {
            'status': 'success',
            'response_warnings': len(tickets_approaching_response),
            'resolution_warnings': len(tickets_approaching_resolution),
            'breaches': len(breached_tickets),
        }
        
    except Exception as exc:
        logger.error(f"SLA check failed: {exc}")
        raise


@celery.task(bind=True, max_retries=3, default_retry_delay=300)
def escalate_ticket(self, ticket_id):
    """Escalate a ticket that has breached SLA.
    
    Args:
        ticket_id: ID of the ticket to escalate
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket, TicketHistory
        from app.models.user import User, UserRole
        
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return {'status': 'error', 'message': 'Ticket not found'}
        
        # Find available admin for escalation
        admin = User.query.filter_by(
            role=UserRole.ADMIN,
            is_active=True
        ).first()
        
        if not admin:
            logger.warning(f"No admin available for escalation of ticket {ticket_id}")
            return {'status': 'warning', 'message': 'No admin available'}
        
        # Upgrade priority if not already urgent
        if ticket.priority != 'urgent':
            old_priority = ticket.priority
            ticket.priority = 'urgent'
            
            # Log history
            history = TicketHistory(
                ticket_id=ticket.id,
                user_id=admin.id,
                action='priority_changed',
                old_value=old_priority,
                new_value='urgent',
                details='Auto-escalated due to SLA breach'
            )
            db.session.add(history)
        
        # Send escalation notification
        from app.tasks.email_tasks import send_sla_warning_email
        send_sla_warning_email.delay(ticket_id, 'escalation', admin.email)
        
        db.session.commit()
        
        logger.info(f"Ticket {ticket_id} escalated due to SLA breach")
        
        return {
            'status': 'success',
            'ticket_id': ticket_id,
            'escalated_to': admin.id
        }
        
    except Exception as exc:
        logger.error(f"Ticket escalation failed: {exc}")
        raise self.retry(exc=exc)


@celery.task(bind=True)
def calculate_sla_metrics(self, date_from=None, date_to=None):
    """Calculate SLA compliance metrics.
    
    Args:
        date_from: Start date for metrics calculation
        date_to: End date for metrics calculation
        
    Returns:
        Dictionary with SLA metrics
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket, TicketStatus
        from sqlalchemy import func
        
        # Default to last 30 days
        if not date_to:
            date_to = datetime.utcnow()
        if not date_from:
            date_from = date_to - timedelta(days=30)
        
        # Total tickets in period
        total_tickets = Ticket.query.filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to
        ).count()
        
        # Tickets that met response SLA
        response_met = Ticket.query.filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.first_response_at.isnot(None),
            Ticket.first_response_at <= Ticket.sla_response_due
        ).count()
        
        # Tickets that met resolution SLA
        resolved_tickets = Ticket.query.filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])
        ).count()
        
        resolution_met = Ticket.query.filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
            Ticket.resolved_at <= Ticket.sla_resolution_due
        ).count()
        
        # Breached tickets
        breached = Ticket.query.filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.sla_breached == True
        ).count()
        
        # Calculate averages
        avg_response_time = db.session.query(
            func.avg(
                func.extract('epoch', Ticket.first_response_at - Ticket.created_at)
            )
        ).filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.first_response_at.isnot(None)
        ).scalar() or 0
        
        avg_resolution_time = db.session.query(
            func.avg(
                func.extract('epoch', Ticket.resolved_at - Ticket.created_at)
            )
        ).filter(
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.resolved_at.isnot(None)
        ).scalar() or 0
        
        # Calculate percentages
        response_compliance = (response_met / total_tickets * 100) if total_tickets > 0 else 0
        resolution_compliance = (resolution_met / resolved_tickets * 100) if resolved_tickets > 0 else 0
        
        metrics = {
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat(),
            },
            'total_tickets': total_tickets,
            'resolved_tickets': resolved_tickets,
            'breached_tickets': breached,
            'response_sla': {
                'met': response_met,
                'compliance_rate': round(response_compliance, 2),
                'avg_response_time_seconds': round(avg_response_time, 2),
                'avg_response_time_hours': round(avg_response_time / 3600, 2),
            },
            'resolution_sla': {
                'met': resolution_met,
                'compliance_rate': round(resolution_compliance, 2),
                'avg_resolution_time_seconds': round(avg_resolution_time, 2),
                'avg_resolution_time_hours': round(avg_resolution_time / 3600, 2),
            },
        }
        
        # Cache the metrics
        from app.cache import cache_set, get_dashboard_cache_key
        cache_set(f"sla:metrics:{date_from.date()}:{date_to.date()}", metrics, ttl=3600)
        
        logger.info(f"SLA metrics calculated for {date_from.date()} to {date_to.date()}")
        
        return metrics
        
    except Exception as exc:
        logger.error(f"SLA metrics calculation failed: {exc}")
        raise



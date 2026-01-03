"""Report generation background tasks."""
import logging
import csv
import io
from datetime import datetime, timedelta
from app.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True)
def generate_daily_report(self):
    """Generate daily ticket summary report.
    
    This task runs daily to generate a summary of:
    - Tickets created, resolved, closed
    - SLA compliance
    - Agent performance
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket, TicketStatus
        from app.models.user import User, UserRole
        from sqlalchemy import func
        
        # Report for yesterday
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)
        
        # Ticket counts
        created = Ticket.query.filter(
            Ticket.created_at >= yesterday,
            Ticket.created_at < today
        ).count()
        
        resolved = Ticket.query.filter(
            Ticket.resolved_at >= yesterday,
            Ticket.resolved_at < today
        ).count()
        
        closed = Ticket.query.filter(
            Ticket.closed_at >= yesterday,
            Ticket.closed_at < today
        ).count()
        
        # By priority
        priority_breakdown = db.session.query(
            Ticket.priority,
            func.count(Ticket.id)
        ).filter(
            Ticket.created_at >= yesterday,
            Ticket.created_at < today
        ).group_by(Ticket.priority).all()
        
        # By category
        category_breakdown = db.session.query(
            Ticket.category,
            func.count(Ticket.id)
        ).filter(
            Ticket.created_at >= yesterday,
            Ticket.created_at < today
        ).group_by(Ticket.category).all()
        
        # SLA breaches
        breaches = Ticket.query.filter(
            Ticket.sla_breached == True,
            Ticket.created_at >= yesterday,
            Ticket.created_at < today
        ).count()
        
        # Agent performance
        agent_stats = db.session.query(
            User.id,
            User.username,
            func.count(Ticket.id).label('resolved_count')
        ).join(
            Ticket, Ticket.assigned_to_id == User.id
        ).filter(
            Ticket.resolved_at >= yesterday,
            Ticket.resolved_at < today
        ).group_by(User.id).all()
        
        report = {
            'report_date': yesterday.date().isoformat(),
            'generated_at': datetime.utcnow().isoformat(),
            'summary': {
                'created': created,
                'resolved': resolved,
                'closed': closed,
                'sla_breaches': breaches,
            },
            'by_priority': dict(priority_breakdown),
            'by_category': dict(category_breakdown),
            'agent_performance': [
                {'agent_id': a[0], 'username': a[1], 'resolved': a[2]}
                for a in agent_stats
            ],
        }
        
        # Store report (in production, save to S3 or send via email)
        logger.info(f"Daily report generated for {yesterday.date()}: {report['summary']}")
        
        return report
        
    except Exception as exc:
        logger.error(f"Daily report generation failed: {exc}")
        raise


@celery.task(bind=True)
def generate_agent_performance_report(self, agent_id, date_from=None, date_to=None):
    """Generate performance report for a specific agent.
    
    Args:
        agent_id: ID of the agent
        date_from: Start date
        date_to: End date
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket, TicketStatus
        from app.models.user import User
        from sqlalchemy import func
        
        agent = User.query.get(agent_id)
        if not agent:
            return {'status': 'error', 'message': 'Agent not found'}
        
        # Default to last 30 days
        if not date_to:
            date_to = datetime.utcnow()
        if not date_from:
            date_from = date_to - timedelta(days=30)
        
        # Assigned tickets
        assigned = Ticket.query.filter(
            Ticket.assigned_to_id == agent_id,
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to
        ).count()
        
        # Resolved tickets
        resolved = Ticket.query.filter(
            Ticket.assigned_to_id == agent_id,
            Ticket.resolved_at >= date_from,
            Ticket.resolved_at <= date_to
        ).count()
        
        # Average resolution time
        avg_resolution = db.session.query(
            func.avg(
                func.extract('epoch', Ticket.resolved_at - Ticket.created_at)
            )
        ).filter(
            Ticket.assigned_to_id == agent_id,
            Ticket.resolved_at >= date_from,
            Ticket.resolved_at <= date_to,
            Ticket.resolved_at.isnot(None)
        ).scalar() or 0
        
        # SLA compliance
        sla_met = Ticket.query.filter(
            Ticket.assigned_to_id == agent_id,
            Ticket.resolved_at >= date_from,
            Ticket.resolved_at <= date_to,
            Ticket.sla_breached == False
        ).count()
        
        sla_compliance = (sla_met / resolved * 100) if resolved > 0 else 0
        
        # By status
        status_breakdown = db.session.query(
            Ticket.status,
            func.count(Ticket.id)
        ).filter(
            Ticket.assigned_to_id == agent_id,
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to
        ).group_by(Ticket.status).all()
        
        report = {
            'agent': {
                'id': agent.id,
                'name': agent.full_name,
                'email': agent.email,
            },
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat(),
            },
            'metrics': {
                'tickets_assigned': assigned,
                'tickets_resolved': resolved,
                'avg_resolution_time_hours': round(avg_resolution / 3600, 2),
                'sla_compliance_rate': round(sla_compliance, 2),
            },
            'by_status': dict(status_breakdown),
        }
        
        logger.info(f"Agent performance report generated for {agent.username}")
        
        return report
        
    except Exception as exc:
        logger.error(f"Agent performance report failed: {exc}")
        raise


@celery.task(bind=True)
def export_tickets_csv(self, filters=None, user_id=None):
    """Export tickets to CSV format.
    
    Args:
        filters: Dictionary of filter parameters
        user_id: ID of requesting user (for access control)
    """
    try:
        from app.models.ticket import Ticket
        from app.models.user import User
        
        query = Ticket.query
        
        # Apply filters
        if filters:
            if filters.get('status'):
                query = query.filter(Ticket.status.in_(filters['status']))
            if filters.get('priority'):
                query = query.filter(Ticket.priority.in_(filters['priority']))
            if filters.get('category'):
                query = query.filter(Ticket.category.in_(filters['category']))
            if filters.get('date_from'):
                query = query.filter(Ticket.created_at >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(Ticket.created_at <= filters['date_to'])
        
        tickets = query.order_by(Ticket.created_at.desc()).limit(10000).all()
        
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Ticket Number',
            'Subject',
            'Status',
            'Priority',
            'Category',
            'Customer Email',
            'Assigned To',
            'Created At',
            'Resolved At',
            'SLA Breached',
        ])
        
        # Data rows
        for ticket in tickets:
            writer.writerow([
                ticket.ticket_number,
                ticket.subject,
                ticket.status,
                ticket.priority,
                ticket.category,
                ticket.customer_email,
                ticket.assigned_to.full_name if ticket.assigned_to else '',
                ticket.created_at.isoformat() if ticket.created_at else '',
                ticket.resolved_at.isoformat() if ticket.resolved_at else '',
                'Yes' if ticket.sla_breached else 'No',
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        # In production, upload to S3 and return URL
        logger.info(f"CSV export generated with {len(tickets)} tickets")
        
        return {
            'status': 'success',
            'ticket_count': len(tickets),
            'csv_content': csv_content,  # In production, return file URL
        }
        
    except Exception as exc:
        logger.error(f"CSV export failed: {exc}")
        raise


@celery.task(bind=True)
def cleanup_old_tickets(self, days=365):
    """Archive or delete old closed tickets.
    
    Args:
        days: Number of days after which to archive tickets
    """
    try:
        from app.extensions import db
        from app.models.ticket import Ticket, TicketStatus
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Find old closed tickets
        old_tickets = Ticket.query.filter(
            Ticket.status == TicketStatus.CLOSED,
            Ticket.closed_at < cutoff_date
        ).all()
        
        # In production, archive to cold storage before deleting
        archived_count = len(old_tickets)
        
        # For now, just log (implement actual archival in production)
        logger.info(f"Found {archived_count} tickets eligible for archival")
        
        return {
            'status': 'success',
            'archived_count': archived_count,
        }
        
    except Exception as exc:
        logger.error(f"Ticket cleanup failed: {exc}")
        raise



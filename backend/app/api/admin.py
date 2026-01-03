"""Admin dashboard and reporting routes."""
from flask import request, jsonify, g
from flask_jwt_extended import jwt_required
from flasgger import swag_from
from sqlalchemy import func, and_
from datetime import datetime, timedelta

from app.api import api_bp
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketStatus, TicketPriority, TicketCategory
from app.utils.decorators import admin_required
from app import db
from app.cache import cache_get, cache_set, cache_delete


def error_response(message, code, details=None, status_code=400):
    """Create standardized error response."""
    response = {'status': 'error', 'message': message, 'code': code}
    if details:
        response['errors'] = details
    return jsonify(response), status_code


# ============================================================================
# DASHBOARD METRICS
# ============================================================================

@api_bp.route('/admin/dashboard', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Admin'],
    'summary': 'Get dashboard metrics',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Dashboard metrics'},
        403: {'description': 'Forbidden'}
    }
})
def get_dashboard_metrics():
    """Get admin dashboard metrics (FR-029)."""
    cache_key = 'admin:dashboard:metrics'
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached), 200
    
    # Ticket counts by status
    status_counts = db.session.query(
        Ticket.status,
        func.count(Ticket.id)
    ).group_by(Ticket.status).all()
    
    tickets_by_status = {
        'open': 0,
        'assigned': 0,
        'in_progress': 0,
        'waiting': 0,
        'resolved': 0,
        'closed': 0,
        'reopened': 0,
    }
    for status, count in status_counts:
        tickets_by_status[status] = count
    
    # Tickets by priority
    priority_counts = db.session.query(
        Ticket.priority,
        func.count(Ticket.id)
    ).group_by(Ticket.priority).all()
    
    tickets_by_priority = dict(priority_counts)
    
    # Tickets by category
    category_counts = db.session.query(
        Ticket.category,
        func.count(Ticket.id)
    ).group_by(Ticket.category).all()
    
    tickets_by_category = dict(category_counts)
    
    # Average resolution time (in hours)
    avg_resolution = db.session.query(
        func.avg(
            func.extract('epoch', Ticket.resolved_at - Ticket.created_at) / 3600
        )
    ).filter(
        Ticket.resolved_at.isnot(None)
    ).scalar() or 0
    
    # SLA compliance rate
    total_with_sla = Ticket.query.filter(
        Ticket.sla_resolution_due.isnot(None)
    ).count()
    
    sla_met = Ticket.query.filter(
        Ticket.sla_resolution_due.isnot(None),
        Ticket.sla_breached == False
    ).count()
    
    sla_compliance = (sla_met / total_with_sla * 100) if total_with_sla > 0 else 100
    
    # Agent performance
    agent_stats = db.session.query(
        User.id,
        User.username,
        User.first_name,
        User.last_name,
        func.count(Ticket.id).label('assigned_count'),
        func.count(
            func.nullif(Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]), False)
        ).label('resolved_count')
    ).outerjoin(
        Ticket, Ticket.assigned_to_id == User.id
    ).filter(
        User.role == UserRole.AGENT
    ).group_by(User.id).all()
    
    agents = []
    for agent in agent_stats:
        agents.append({
            'id': agent.id,
            'username': agent.username,
            'full_name': f'{agent.first_name or ""} {agent.last_name or ""}'.strip() or agent.username,
            'assigned_count': agent.assigned_count or 0,
            'resolved_count': agent.resolved_count or 0,
        })
    
    # Today's statistics
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    created_today = Ticket.query.filter(Ticket.created_at >= today).count()
    resolved_today = Ticket.query.filter(Ticket.resolved_at >= today).count()
    
    # Tickets approaching SLA
    now = datetime.utcnow()
    warning_time = now + timedelta(hours=2)
    
    approaching_sla = Ticket.query.filter(
        Ticket.status.notin_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
        Ticket.sla_resolution_due <= warning_time,
        Ticket.sla_resolution_due > now
    ).count()
    
    result = {
        'status': 'success',
        'data': {
            'summary': {
                'total_tickets': sum(tickets_by_status.values()),
                'open_tickets': tickets_by_status['open'] + tickets_by_status['assigned'] + tickets_by_status['in_progress'],
                'pending_tickets': tickets_by_status['waiting'],
                'resolved_tickets': tickets_by_status['resolved'] + tickets_by_status['closed'],
            },
            'tickets_by_status': tickets_by_status,
            'tickets_by_priority': tickets_by_priority,
            'tickets_by_category': tickets_by_category,
            'performance': {
                'avg_resolution_time_hours': round(avg_resolution, 2),
                'sla_compliance_rate': round(sla_compliance, 2),
                'created_today': created_today,
                'resolved_today': resolved_today,
                'approaching_sla': approaching_sla,
            },
            'agents': agents,
            'generated_at': datetime.utcnow().isoformat(),
        }
    }
    
    # Cache for 2 minutes
    cache_set(cache_key, result, ttl=120)
    
    return jsonify(result), 200


# ============================================================================
# REPORTS
# ============================================================================

@api_bp.route('/admin/reports/tickets', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Admin'],
    'summary': 'Get ticket volume report',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'period', 'in': 'query', 'type': 'string', 'enum': ['daily', 'weekly', 'monthly']},
        {'name': 'date_from', 'in': 'query', 'type': 'string', 'format': 'date'},
        {'name': 'date_to', 'in': 'query', 'type': 'string', 'format': 'date'},
    ],
    'responses': {
        200: {'description': 'Ticket volume report'}
    }
})
def get_ticket_report():
    """Get ticket volume report (FR-030)."""
    period = request.args.get('period', 'daily')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    # Default to last 30 days
    if not date_to:
        date_to = datetime.utcnow()
    else:
        date_to = datetime.fromisoformat(date_to)
    
    if not date_from:
        date_from = date_to - timedelta(days=30)
    else:
        date_from = datetime.fromisoformat(date_from)
    
    # Get tickets in date range
    tickets = Ticket.query.filter(
        Ticket.created_at >= date_from,
        Ticket.created_at <= date_to
    ).all()
    
    # Group by period
    if period == 'daily':
        grouper = lambda t: t.created_at.date()
    elif period == 'weekly':
        grouper = lambda t: t.created_at.isocalendar()[:2]
    else:  # monthly
        grouper = lambda t: (t.created_at.year, t.created_at.month)
    
    from collections import defaultdict
    volume = defaultdict(lambda: {'created': 0, 'resolved': 0, 'closed': 0})
    
    for ticket in tickets:
        key = str(grouper(ticket))
        volume[key]['created'] += 1
        if ticket.resolved_at and ticket.resolved_at >= date_from:
            volume[key]['resolved'] += 1
        if ticket.closed_at and ticket.closed_at >= date_from:
            volume[key]['closed'] += 1
    
    return jsonify({
        'status': 'success',
        'data': {
            'period': period,
            'date_from': date_from.isoformat(),
            'date_to': date_to.isoformat(),
            'volume': dict(volume),
            'total_created': len(tickets),
        }
    }), 200


@api_bp.route('/admin/reports/agents', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Admin'],
    'summary': 'Get agent performance report',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Agent performance report'}
    }
})
def get_agent_report():
    """Get agent performance report (FR-030)."""
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    if not date_to:
        date_to = datetime.utcnow()
    else:
        date_to = datetime.fromisoformat(date_to)
    
    if not date_from:
        date_from = date_to - timedelta(days=30)
    else:
        date_from = datetime.fromisoformat(date_from)
    
    agents = User.query.filter_by(role=UserRole.AGENT, is_active=True).all()
    
    report = []
    for agent in agents:
        assigned = Ticket.query.filter(
            Ticket.assigned_to_id == agent.id,
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to
        ).count()
        
        resolved = Ticket.query.filter(
            Ticket.assigned_to_id == agent.id,
            Ticket.resolved_at >= date_from,
            Ticket.resolved_at <= date_to
        ).count()
        
        avg_time = db.session.query(
            func.avg(
                func.extract('epoch', Ticket.resolved_at - Ticket.created_at) / 3600
            )
        ).filter(
            Ticket.assigned_to_id == agent.id,
            Ticket.resolved_at >= date_from,
            Ticket.resolved_at <= date_to
        ).scalar() or 0
        
        sla_met = Ticket.query.filter(
            Ticket.assigned_to_id == agent.id,
            Ticket.resolved_at >= date_from,
            Ticket.resolved_at <= date_to,
            Ticket.sla_breached == False
        ).count()
        
        sla_rate = (sla_met / resolved * 100) if resolved > 0 else 100
        
        report.append({
            'agent': {
                'id': agent.id,
                'username': agent.username,
                'full_name': agent.full_name,
                'availability': agent.availability_status,
            },
            'metrics': {
                'tickets_assigned': assigned,
                'tickets_resolved': resolved,
                'avg_resolution_hours': round(avg_time, 2),
                'sla_compliance_rate': round(sla_rate, 2),
            }
        })
    
    return jsonify({
        'status': 'success',
        'data': {
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat(),
            },
            'agents': report,
        }
    }), 200


@api_bp.route('/admin/reports/sla', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Admin'],
    'summary': 'Get SLA compliance report',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'SLA compliance report'}
    }
})
def get_sla_report():
    """Get SLA compliance report (FR-030)."""
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    if not date_to:
        date_to = datetime.utcnow()
    else:
        date_to = datetime.fromisoformat(date_to)
    
    if not date_from:
        date_from = date_to - timedelta(days=30)
    else:
        date_from = datetime.fromisoformat(date_from)
    
    # SLA by priority
    sla_by_priority = {}
    for priority in TicketPriority.ALL:
        total = Ticket.query.filter(
            Ticket.priority == priority,
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to
        ).count()
        
        breached = Ticket.query.filter(
            Ticket.priority == priority,
            Ticket.created_at >= date_from,
            Ticket.created_at <= date_to,
            Ticket.sla_breached == True
        ).count()
        
        sla_by_priority[priority] = {
            'total': total,
            'breached': breached,
            'compliance_rate': round((1 - breached / total) * 100, 2) if total > 0 else 100,
        }
    
    # Overall SLA
    total_tickets = Ticket.query.filter(
        Ticket.created_at >= date_from,
        Ticket.created_at <= date_to
    ).count()
    
    total_breached = Ticket.query.filter(
        Ticket.created_at >= date_from,
        Ticket.created_at <= date_to,
        Ticket.sla_breached == True
    ).count()
    
    # Response time SLA
    response_met = Ticket.query.filter(
        Ticket.created_at >= date_from,
        Ticket.created_at <= date_to,
        Ticket.first_response_at.isnot(None),
        Ticket.first_response_at <= Ticket.sla_response_due
    ).count()
    
    tickets_with_response = Ticket.query.filter(
        Ticket.created_at >= date_from,
        Ticket.created_at <= date_to,
        Ticket.first_response_at.isnot(None)
    ).count()
    
    return jsonify({
        'status': 'success',
        'data': {
            'period': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat(),
            },
            'overall': {
                'total_tickets': total_tickets,
                'breached_tickets': total_breached,
                'compliance_rate': round((1 - total_breached / total_tickets) * 100, 2) if total_tickets > 0 else 100,
            },
            'response_sla': {
                'total_responded': tickets_with_response,
                'met_sla': response_met,
                'compliance_rate': round((response_met / tickets_with_response) * 100, 2) if tickets_with_response > 0 else 100,
            },
            'by_priority': sla_by_priority,
        }
    }), 200


# ============================================================================
# AGENTS MANAGEMENT
# ============================================================================

@api_bp.route('/agents', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Agents'],
    'summary': 'List all agents',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'List of agents'}
    }
})
def list_agents():
    """List all support agents (FR-033)."""
    agents = User.query.filter_by(role=UserRole.AGENT, is_active=True).all()
    
    return jsonify({
        'status': 'success',
        'data': {
            'agents': [a.to_dict(include_agent_info=True) for a in agents],
            'total': len(agents)
        }
    }), 200


@api_bp.route('/agents/<int:agent_id>/tickets', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Agents'],
    'summary': 'Get agent tickets',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Agent tickets'},
        404: {'description': 'Agent not found'}
    }
})
def get_agent_tickets(agent_id):
    """Get tickets assigned to an agent."""
    agent = User.query.filter_by(id=agent_id, role=UserRole.AGENT).first()
    if not agent:
        return error_response('Agent not found', 'NOT_FOUND', status_code=404)
    
    status = request.args.get('status')
    
    query = Ticket.query.filter_by(assigned_to_id=agent_id)
    if status:
        query = query.filter_by(status=status)
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    return jsonify({
        'status': 'success',
        'data': {
            'agent': agent.to_dict(include_agent_info=True),
            'tickets': [t.to_dict() for t in tickets],
            'total': len(tickets)
        }
    }), 200


@api_bp.route('/agents/<int:agent_id>/availability', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Agents'],
    'summary': 'Update agent availability',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Availability updated'},
        404: {'description': 'Agent not found'}
    }
})
def update_agent_availability(agent_id):
    """Update agent availability status."""
    from flask_jwt_extended import get_jwt_identity
    from app.models.user import AvailabilityStatus
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Only the agent themselves or admin can update
    if user_id != agent_id and not user.is_admin:
        return error_response('Forbidden', 'FORBIDDEN', status_code=403)
    
    agent = User.query.filter_by(id=agent_id, role=UserRole.AGENT).first()
    if not agent:
        return error_response('Agent not found', 'NOT_FOUND', status_code=404)
    
    status = request.json.get('availability_status')
    if status not in AvailabilityStatus.ALL:
        return error_response(
            f'Invalid status. Must be one of: {", ".join(AvailabilityStatus.ALL)}',
            'VALIDATION_ERROR'
        )
    
    agent.availability_status = status
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': f'Availability updated to {status}',
        'data': agent.to_dict(include_agent_info=True)
    }), 200



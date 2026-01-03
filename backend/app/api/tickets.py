"""Ticket routes for customer support system."""
from flask import request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from sqlalchemy import or_, and_

from app.api import api_bp
from app.models.user import User, UserRole
from app.models.ticket import (
    Ticket, TicketStatus, TicketPriority, TicketCategory,
    TicketComment, TicketHistory, TicketAssignment
)
from app.schemas.ticket import (
    TicketSchema, TicketCreateSchema, TicketUpdateSchema,
    TicketStatusUpdateSchema, TicketPriorityUpdateSchema,
    TicketAssignSchema, TicketCommentSchema, TicketCommentCreateSchema,
    TicketSearchSchema, TicketHistorySchema
)
from app.utils.decorators import admin_required, agent_or_admin_required, require_role
from app import db


def create_error_response(message, code, details=None, status_code=400):
    """Create standardized error response."""
    response = {
        'status': 'error',
        'message': message,
        'code': code,
    }
    if details:
        response['errors'] = details
    return jsonify(response), status_code


def create_history_entry(ticket, action, user, old_value=None, new_value=None, details=None):
    """Create a ticket history entry."""
    entry = TicketHistory(
        ticket_id=ticket.id,
        user_id=user.id,
        action=action,
        old_value=old_value,
        new_value=new_value,
        details=details
    )
    db.session.add(entry)
    return entry


# ============================================================================
# TICKET CRUD OPERATIONS
# ============================================================================

@api_bp.route('/tickets', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'List tickets with filters',
    'description': 'Get tickets based on user role and filters',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'ticket_number', 'in': 'query', 'type': 'string'},
        {'name': 'keyword', 'in': 'query', 'type': 'string'},
        {'name': 'status', 'in': 'query', 'type': 'array', 'items': {'type': 'string'}},
        {'name': 'priority', 'in': 'query', 'type': 'array', 'items': {'type': 'string'}},
        {'name': 'category', 'in': 'query', 'type': 'array', 'items': {'type': 'string'}},
        {'name': 'assigned_to_id', 'in': 'query', 'type': 'integer'},
        {'name': 'unassigned', 'in': 'query', 'type': 'boolean'},
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 20},
    ],
    'responses': {
        200: {'description': 'List of tickets'},
        401: {'description': 'Unauthorized'}
    }
})
def list_tickets():
    """List tickets with role-based filtering."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    # Build base query based on role
    if user.is_admin:
        query = Ticket.query
    elif user.is_agent:
        # Agents see assigned tickets + unassigned queue
        query = Ticket.query.filter(
            or_(
                Ticket.assigned_to_id == user.id,
                Ticket.assigned_to_id.is_(None)
            )
        )
    else:
        # Customers see only their own tickets
        query = Ticket.query.filter_by(customer_id=user.id)
    
    # Apply filters
    ticket_number = request.args.get('ticket_number')
    if ticket_number:
        query = query.filter(Ticket.ticket_number.ilike(f'%{ticket_number}%'))
    
    keyword = request.args.get('keyword')
    if keyword:
        query = query.filter(
            or_(
                Ticket.subject.ilike(f'%{keyword}%'),
                Ticket.description.ilike(f'%{keyword}%')
            )
        )
    
    customer_email = request.args.get('customer_email')
    if customer_email and (user.is_admin or user.is_agent):
        query = query.filter(Ticket.customer_email.ilike(f'%{customer_email}%'))
    
    statuses = request.args.getlist('status')
    if statuses:
        query = query.filter(Ticket.status.in_(statuses))
    
    priorities = request.args.getlist('priority')
    if priorities:
        query = query.filter(Ticket.priority.in_(priorities))
    
    categories = request.args.getlist('category')
    if categories:
        query = query.filter(Ticket.category.in_(categories))
    
    assigned_to_id = request.args.get('assigned_to_id', type=int)
    if assigned_to_id and (user.is_admin or user.is_agent):
        query = query.filter_by(assigned_to_id=assigned_to_id)
    
    unassigned = request.args.get('unassigned', '').lower() == 'true'
    if unassigned and (user.is_admin or user.is_agent):
        query = query.filter(Ticket.assigned_to_id.is_(None))
    
    # Date range filters
    date_from = request.args.get('date_from')
    if date_from:
        query = query.filter(Ticket.created_at >= date_from)
    
    date_to = request.args.get('date_to')
    if date_to:
        query = query.filter(Ticket.created_at <= date_to)
    
    # Sorting
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    if hasattr(Ticket, sort_by):
        sort_column = getattr(Ticket, sort_by)
        if sort_order == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'status': 'success',
        'data': {
            'tickets': [t.to_dict() for t in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }
    }), 200


@api_bp.route('/tickets', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Create a new ticket',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'subject': {'type': 'string', 'minLength': 5, 'maxLength': 200},
                    'description': {'type': 'string', 'minLength': 20, 'maxLength': 5000},
                    'priority': {'type': 'string', 'enum': ['low', 'medium', 'high', 'urgent']},
                    'category': {'type': 'string', 'enum': ['technical', 'billing', 'general', 'feature_request']},
                    'customer_email': {'type': 'string', 'format': 'email'}
                },
                'required': ['subject', 'description', 'category', 'customer_email']
            }
        }
    ],
    'responses': {
        201: {'description': 'Ticket created successfully'},
        400: {'description': 'Validation error'},
        401: {'description': 'Unauthorized'}
    }
})
def create_ticket():
    """Create a new support ticket."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    # Validate request data
    schema = TicketCreateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return create_error_response(
            'Validation failed',
            'VALIDATION_ERROR',
            details=errors,
            status_code=400
        )
    
    try:
        data = schema.load(request.json)
    except Exception as e:
        return create_error_response(str(e), 'VALIDATION_ERROR', status_code=400)
    
    # Create ticket
    ticket = Ticket(
        ticket_number=Ticket.generate_ticket_number(),
        subject=data['subject'],
        description=data['description'],
        priority=data.get('priority', TicketPriority.MEDIUM),
        category=data['category'],
        customer_email=data['customer_email'],
        customer_id=user.id,
        status=TicketStatus.OPEN
    )
    
    # Calculate SLA deadlines
    ticket.calculate_sla_deadlines()
    
    db.session.add(ticket)
    db.session.flush()  # Get ticket ID
    
    # Create history entry
    create_history_entry(
        ticket, 'created', user,
        new_value=ticket.status,
        details=f'Ticket created with priority: {ticket.priority}'
    )
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Ticket created successfully',
        'data': ticket.to_dict()
    }), 201


@api_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Get ticket details',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'ticket_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Ticket details'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def get_ticket(ticket_id):
    """Get ticket details."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    # Check access
    if not user.can_access_ticket(ticket):
        return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
    
    return jsonify({
        'status': 'success',
        'data': ticket.to_dict()
    }), 200


@api_bp.route('/tickets/<int:ticket_id>', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Update ticket',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Ticket updated'},
        400: {'description': 'Validation error'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def update_ticket(ticket_id):
    """Update ticket details."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    # Only customer (owner) or agent/admin can update
    if not user.can_access_ticket(ticket):
        return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
    
    # Customers can only update their own open tickets
    if user.is_customer and ticket.status not in [TicketStatus.OPEN, TicketStatus.WAITING]:
        return create_error_response(
            'Cannot update ticket in current status',
            'FORBIDDEN',
            status_code=403
        )
    
    schema = TicketUpdateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return create_error_response('Validation failed', 'VALIDATION_ERROR', details=errors, status_code=400)
    
    data = schema.load(request.json)
    
    # Track changes for history
    changes = []
    for key, value in data.items():
        if hasattr(ticket, key):
            old_value = getattr(ticket, key)
            if old_value != value:
                changes.append(f'{key}: {old_value} → {value}')
                setattr(ticket, key, value)
    
    if changes:
        create_history_entry(
            ticket, 'updated', user,
            details='; '.join(changes)
        )
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Ticket updated successfully',
        'data': ticket.to_dict()
    }), 200


@api_bp.route('/tickets/<int:ticket_id>', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Delete ticket (admin only)',
    'security': [{'Bearer': []}],
    'responses': {
        204: {'description': 'Ticket deleted'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def delete_ticket(ticket_id):
    """Delete a ticket (admin only)."""
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    db.session.delete(ticket)
    db.session.commit()
    
    return '', 204


# ============================================================================
# STATUS MANAGEMENT
# ============================================================================

@api_bp.route('/tickets/<int:ticket_id>/status', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Update ticket status',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'ticket_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'enum': ['open', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed', 'reopened']},
                    'reason': {'type': 'string'}
                },
                'required': ['status']
            }
        }
    ],
    'responses': {
        200: {'description': 'Status updated'},
        400: {'description': 'Invalid status transition'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def update_ticket_status(ticket_id):
    """Update ticket status with transition validation."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    # Only agents and admins can update status
    if user.is_customer:
        # Customers can only reopen resolved tickets
        new_status = request.json.get('status')
        if new_status != TicketStatus.REOPENED or ticket.status != TicketStatus.RESOLVED:
            return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
        if ticket.customer_id != user.id:
            return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
    
    schema = TicketStatusUpdateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return create_error_response('Validation failed', 'VALIDATION_ERROR', details=errors, status_code=400)
    
    data = schema.load(request.json)
    new_status = data['status']
    old_status = ticket.status
    
    # Validate transition
    if not ticket.can_transition_to(new_status):
        return create_error_response(
            f'Invalid status transition: {old_status} → {new_status}',
            'VALIDATION_ERROR',
            status_code=400
        )
    
    # Perform transition
    ticket.transition_to(new_status)
    
    # Create history entry
    create_history_entry(
        ticket, 'status_changed', user,
        old_value=old_status,
        new_value=new_status,
        details=data.get('reason')
    )
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': f'Status changed to {new_status}',
        'data': ticket.to_dict()
    }), 200


# ============================================================================
# PRIORITY MANAGEMENT
# ============================================================================

@api_bp.route('/tickets/<int:ticket_id>/priority', methods=['PUT'])
@jwt_required()
@agent_or_admin_required
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Update ticket priority',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'ticket_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'priority': {'type': 'string', 'enum': ['low', 'medium', 'high', 'urgent']},
                    'reason': {'type': 'string', 'minLength': 5}
                },
                'required': ['priority', 'reason']
            }
        }
    ],
    'responses': {
        200: {'description': 'Priority updated'},
        400: {'description': 'Validation error'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def update_ticket_priority(ticket_id):
    """Update ticket priority (requires reason)."""
    user = g.current_user
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    schema = TicketPriorityUpdateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return create_error_response('Validation failed', 'VALIDATION_ERROR', details=errors, status_code=400)
    
    data = schema.load(request.json)
    
    old_priority = ticket.priority
    new_priority = data['priority']
    
    if old_priority == new_priority:
        return create_error_response('Priority is already set to this value', 'VALIDATION_ERROR', status_code=400)
    
    ticket.priority = new_priority
    
    # Recalculate SLA if priority changed
    ticket.calculate_sla_deadlines()
    
    # Create history entry
    create_history_entry(
        ticket, 'priority_changed', user,
        old_value=old_priority,
        new_value=new_priority,
        details=data['reason']
    )
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': f'Priority changed to {new_priority}',
        'data': ticket.to_dict()
    }), 200


# ============================================================================
# ASSIGNMENT
# ============================================================================

@api_bp.route('/tickets/<int:ticket_id>/assign', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Assign ticket to agent',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'ticket_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'agent_id': {'type': 'integer'}
                },
                'required': ['agent_id']
            }
        }
    ],
    'responses': {
        200: {'description': 'Ticket assigned'},
        400: {'description': 'Invalid agent'},
        404: {'description': 'Not found'}
    }
})
def assign_ticket(ticket_id):
    """Assign ticket to an agent."""
    user = g.current_user
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    schema = TicketAssignSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return create_error_response('Validation failed', 'VALIDATION_ERROR', details=errors, status_code=400)
    
    data = schema.load(request.json)
    agent = User.query.get(data['agent_id'])
    
    if not agent:
        return create_error_response('Agent not found', 'NOT_FOUND', status_code=404)
    
    if not agent.is_agent and not agent.is_admin:
        return create_error_response('User is not an agent', 'VALIDATION_ERROR', status_code=400)
    
    if not agent.is_active:
        return create_error_response('Agent account is disabled', 'VALIDATION_ERROR', status_code=400)
    
    old_assigned = ticket.assigned_to_id
    ticket.assigned_to_id = agent.id
    
    # Update status if currently open
    if ticket.status == TicketStatus.OPEN:
        ticket.status = TicketStatus.ASSIGNED
    
    # Create assignment record
    assignment = TicketAssignment(
        ticket_id=ticket.id,
        assigned_to_id=agent.id,
        assigned_by_id=user.id
    )
    db.session.add(assignment)
    
    # Create history entry
    create_history_entry(
        ticket, 'assigned', user,
        old_value=str(old_assigned) if old_assigned else None,
        new_value=str(agent.id),
        details=f'Assigned to {agent.full_name}'
    )
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': f'Ticket assigned to {agent.full_name}',
        'data': ticket.to_dict()
    }), 200


# ============================================================================
# COMMENTS
# ============================================================================

@api_bp.route('/tickets/<int:ticket_id>/comments', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Get ticket comments',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'List of comments'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def get_ticket_comments(ticket_id):
    """Get all comments for a ticket."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    if not user.can_access_ticket(ticket):
        return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
    
    # Filter internal comments for customers
    query = ticket.ticket_comments.order_by(TicketComment.created_at.asc())
    if user.is_customer:
        query = query.filter_by(is_internal=False)
    
    comments = query.all()
    
    return jsonify({
        'status': 'success',
        'data': {
            'comments': [c.to_dict() for c in comments],
            'total': len(comments)
        }
    }), 200


@api_bp.route('/tickets/<int:ticket_id>/comments', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Add comment to ticket',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'ticket_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'content': {'type': 'string', 'minLength': 1, 'maxLength': 5000},
                    'is_internal': {'type': 'boolean', 'default': False}
                },
                'required': ['content']
            }
        }
    ],
    'responses': {
        201: {'description': 'Comment added'},
        400: {'description': 'Validation error'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def add_ticket_comment(ticket_id):
    """Add a comment to a ticket."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    if not user.can_access_ticket(ticket):
        return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
    
    schema = TicketCommentCreateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return create_error_response('Validation failed', 'VALIDATION_ERROR', details=errors, status_code=400)
    
    data = schema.load(request.json)
    
    # Customers cannot add internal comments
    is_internal = data.get('is_internal', False)
    if user.is_customer and is_internal:
        is_internal = False
    
    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=user.id,
        content=data['content'],
        is_internal=is_internal
    )
    
    db.session.add(comment)
    
    # Record first response time if agent/admin is commenting
    if (user.is_agent or user.is_admin) and not ticket.first_response_at:
        ticket.record_first_response()
    
    # Create history entry
    create_history_entry(
        ticket, 'commented', user,
        details=f'{"Internal note" if is_internal else "Comment"} added'
    )
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Comment added successfully',
        'data': comment.to_dict()
    }), 201


# ============================================================================
# HISTORY
# ============================================================================

@api_bp.route('/tickets/<int:ticket_id>/history', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Tickets'],
    'summary': 'Get ticket history',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Ticket history'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def get_ticket_history(ticket_id):
    """Get ticket history/audit log."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return create_error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return create_error_response('Ticket not found', 'NOT_FOUND', status_code=404)
    
    if not user.can_access_ticket(ticket):
        return create_error_response('Insufficient permissions', 'FORBIDDEN', status_code=403)
    
    history = ticket.history.order_by(TicketHistory.created_at.desc()).all()
    
    return jsonify({
        'status': 'success',
        'data': {
            'history': [h.to_dict() for h in history],
            'total': len(history)
        }
    }), 200



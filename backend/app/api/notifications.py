"""Notification routes."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from

from app.api import api_bp
from app.models import Notification
from app.schemas import NotificationSchema, NotificationUpdateSchema, NotificationBulkUpdateSchema
from app import db


@api_bp.route('/notifications', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Get all notifications',
    'description': 'Get all notifications for the current user',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'unread_only', 'in': 'query', 'type': 'boolean', 'default': False},
        {'name': 'type', 'in': 'query', 'type': 'string'},
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 20}
    ],
    'responses': {
        200: {'description': 'List of notifications'},
        401: {'description': 'Unauthorized'}
    }
})
def get_notifications():
    """Get all notifications for current user."""
    user_id = get_jwt_identity()
    
    query = Notification.query.filter_by(user_id=user_id)
    
    # Filter by unread
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    if unread_only:
        query = query.filter_by(is_read=False)
    
    # Filter by type
    notification_type = request.args.get('type')
    if notification_type:
        query = query.filter_by(type=notification_type)
    
    # Order by newest first
    query = query.order_by(Notification.created_at.desc())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Get unread count
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    
    schema = NotificationSchema(many=True)
    
    return jsonify({
        'notifications': schema.dump(pagination.items),
        'total': pagination.total,
        'unread_count': unread_count,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Get unread notification count',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Unread count'}
    }
})
def get_unread_count():
    """Get unread notification count."""
    user_id = get_jwt_identity()
    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    
    return jsonify({'unread_count': count}), 200


@api_bp.route('/notifications/<int:notification_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Get notification by ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'notification_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Notification data'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def get_notification(notification_id):
    """Get a notification by ID."""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first_or_404()
    
    return jsonify(NotificationSchema().dump(notification)), 200


@api_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Mark notification as read',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'notification_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Notification marked as read'},
        404: {'description': 'Not found'}
    }
})
def mark_notification_read(notification_id):
    """Mark a notification as read."""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first_or_404()
    
    notification.mark_as_read()
    db.session.commit()
    
    return jsonify(NotificationSchema().dump(notification)), 200


@api_bp.route('/notifications/read-all', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Mark all notifications as read',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'All notifications marked as read'}
    }
})
def mark_all_notifications_read():
    """Mark all notifications as read."""
    user_id = get_jwt_identity()
    
    from datetime import datetime
    
    Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).update({
        'is_read': True,
        'read_at': datetime.utcnow()
    })
    
    db.session.commit()
    
    return jsonify({'message': 'All notifications marked as read'}), 200


@api_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Delete notification',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'notification_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        204: {'description': 'Notification deleted'},
        404: {'description': 'Not found'}
    }
})
def delete_notification(notification_id):
    """Delete a notification."""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=user_id
    ).first_or_404()
    
    db.session.delete(notification)
    db.session.commit()
    
    return '', 204


@api_bp.route('/notifications/clear', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Notifications'],
    'summary': 'Clear all notifications',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'All notifications cleared'}
    }
})
def clear_all_notifications():
    """Clear all notifications for current user."""
    user_id = get_jwt_identity()
    
    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'All notifications cleared'}), 200




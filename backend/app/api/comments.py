"""Comment routes."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from

from app.api import api_bp
from app.models import Comment, Task, Notification, NotificationType
from app.schemas import CommentSchema, CommentCreateSchema, CommentUpdateSchema
from app import db


@api_bp.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Get task comments',
    'description': 'Get all comments for a task',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'task_id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 20}
    ],
    'responses': {
        200: {'description': 'List of comments'},
        404: {'description': 'Task not found'}
    }
})
def get_task_comments(task_id):
    """Get all comments for a task."""
    task = Task.query.get_or_404(task_id)
    
    # Get top-level comments only (not replies)
    query = Comment.query.filter_by(task_id=task_id, parent_id=None)
    query = query.order_by(Comment.created_at.desc())
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    schema = CommentSchema(many=True)
    
    return jsonify({
        'comments': schema.dump(pagination.items),
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Add comment to task',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'task_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'content': {'type': 'string'},
                    'parent_id': {'type': 'integer'}
                },
                'required': ['content']
            }
        }
    ],
    'responses': {
        201: {'description': 'Comment created'},
        400: {'description': 'Validation error'},
        404: {'description': 'Task not found'}
    }
})
def create_comment(task_id):
    """Create a new comment on a task."""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    
    schema = CommentCreateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    # Validate parent comment if provided
    parent_id = data.get('parent_id')
    if parent_id:
        parent = Comment.query.filter_by(id=parent_id, task_id=task_id).first()
        if not parent:
            return jsonify({'error': 'Invalid parent comment'}), 400
    
    comment = Comment(
        content=data['content'],
        task_id=task_id,
        user_id=user_id,
        parent_id=parent_id
    )
    
    db.session.add(comment)
    
    # Create notification for task owner if different from commenter
    if task.user_id != user_id:
        notification = Notification(
            type=NotificationType.COMMENT_ADDED,
            title='New comment on your task',
            message=f'Someone commented on "{task.title}"',
            data={'task_id': task_id, 'comment_id': comment.id},
            user_id=task.user_id,
            sender_id=user_id
        )
        db.session.add(notification)
    
    # If replying to a comment, notify the parent comment author
    if parent_id:
        parent_comment = Comment.query.get(parent_id)
        if parent_comment and parent_comment.user_id != user_id:
            notification = Notification(
                type=NotificationType.COMMENT_ADDED,
                title='New reply to your comment',
                message=f'Someone replied to your comment on "{task.title}"',
                data={'task_id': task_id, 'comment_id': comment.id},
                user_id=parent_comment.user_id,
                sender_id=user_id
            )
            db.session.add(notification)
    
    db.session.commit()
    
    return jsonify(CommentSchema().dump(comment)), 201


@api_bp.route('/comments/<int:comment_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Get comment by ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'comment_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Comment data'},
        404: {'description': 'Not found'}
    }
})
def get_comment(comment_id):
    """Get a comment by ID."""
    comment = Comment.query.get_or_404(comment_id)
    return jsonify(CommentSchema().dump(comment)), 200


@api_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Update comment',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'comment_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'content': {'type': 'string'}
                },
                'required': ['content']
            }
        }
    ],
    'responses': {
        200: {'description': 'Comment updated'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def update_comment(comment_id):
    """Update a comment."""
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    
    # Only comment author can update
    if comment.user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    
    schema = CommentUpdateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    comment.content = data['content']
    
    db.session.commit()
    
    return jsonify(CommentSchema().dump(comment)), 200


@api_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Delete comment',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'comment_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        204: {'description': 'Comment deleted'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def delete_comment(comment_id):
    """Delete a comment."""
    user_id = get_jwt_identity()
    comment = Comment.query.get_or_404(comment_id)
    
    # Only comment author or task owner can delete
    if comment.user_id != user_id and comment.task.user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return '', 204


@api_bp.route('/comments/<int:comment_id>/replies', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Get comment replies',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'comment_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'List of replies'},
        404: {'description': 'Not found'}
    }
})
def get_comment_replies(comment_id):
    """Get replies to a comment."""
    comment = Comment.query.get_or_404(comment_id)
    replies = comment.replies.order_by(Comment.created_at.asc()).all()
    
    return jsonify({
        'replies': CommentSchema(many=True).dump(replies),
        'total': len(replies)
    }), 200




"""User routes."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from

from app.api import api_bp
from app.models import User
from app.schemas import UserSchema, UserUpdateSchema
from app import db


@api_bp.route('/users', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Users'],
    'summary': 'Get all users',
    'description': 'Get a list of all users (admin only)',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'page',
            'in': 'query',
            'type': 'integer',
            'default': 1
        },
        {
            'name': 'per_page',
            'in': 'query',
            'type': 'integer',
            'default': 20
        }
    ],
    'responses': {
        200: {
            'description': 'List of users',
            'schema': {
                'type': 'object',
                'properties': {
                    'users': {'type': 'array', 'items': {'$ref': '#/definitions/User'}},
                    'total': {'type': 'integer'},
                    'page': {'type': 'integer'},
                    'per_page': {'type': 'integer'}
                }
            }
        },
        401: {'description': 'Unauthorized'},
        403: {'description': 'Forbidden'}
    }
})
def get_users():
    """Get all users."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = User.query.filter_by(is_active=True).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    schema = UserSchema(many=True)
    
    return jsonify({
        'users': schema.dump(pagination.items),
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Users'],
    'summary': 'Get user by ID',
    'description': 'Get a specific user by their ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'user_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        }
    ],
    'responses': {
        200: {
            'description': 'User data',
            'schema': {'$ref': '#/definitions/User'}
        },
        404: {'description': 'User not found'}
    }
})
def get_user(user_id):
    """Get a user by ID."""
    user = User.query.get_or_404(user_id)
    return jsonify(UserSchema().dump(user)), 200


@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Users'],
    'summary': 'Update user',
    'description': 'Update user information',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'user_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        },
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'first_name': {'type': 'string'},
                    'last_name': {'type': 'string'},
                    'avatar_url': {'type': 'string'}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'User updated',
            'schema': {'$ref': '#/definitions/User'}
        },
        400: {'description': 'Validation error'},
        403: {'description': 'Forbidden'},
        404: {'description': 'User not found'}
    }
})
def update_user(user_id):
    """Update a user."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    # Users can only update their own profile (unless admin)
    current_user = User.query.get(current_user_id)
    if current_user_id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Forbidden'}), 403
    
    schema = UserUpdateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    # Update fields
    for key, value in data.items():
        if hasattr(user, key) and key not in ['current_password', 'new_password']:
            setattr(user, key, value)
    
    # Handle password change
    if data.get('new_password'):
        if not data.get('current_password'):
            return jsonify({'error': 'Current password required'}), 400
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Invalid current password'}), 400
        user.set_password(data['new_password'])
    
    db.session.commit()
    
    return jsonify(UserSchema().dump(user)), 200


@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Users'],
    'summary': 'Delete user',
    'description': 'Soft delete a user (deactivate)',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'user_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        }
    ],
    'responses': {
        204: {'description': 'User deleted'},
        403: {'description': 'Forbidden'},
        404: {'description': 'User not found'}
    }
})
def delete_user(user_id):
    """Soft delete a user."""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user_id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Forbidden'}), 403
    
    user = User.query.get_or_404(user_id)
    user.is_active = False
    db.session.commit()
    
    return '', 204




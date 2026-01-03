"""Authentication routes."""
from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from flasgger import swag_from

from app.api import api_bp
from app.models import User
from app.schemas import LoginSchema, UserCreateSchema, UserSchema, TokenSchema
from app import db


@api_bp.route('/auth/register', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Register a new user',
    'description': 'Create a new user account',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'email': {'type': 'string', 'format': 'email'},
                    'username': {'type': 'string', 'minLength': 3},
                    'password': {'type': 'string', 'minLength': 8},
                    'first_name': {'type': 'string'},
                    'last_name': {'type': 'string'},
                },
                'required': ['email', 'username', 'password']
            }
        }
    ],
    'responses': {
        201: {
            'description': 'User created successfully',
            'schema': {'$ref': '#/definitions/User'}
        },
        400: {'description': 'Validation error'},
        409: {'description': 'User already exists'}
    }
})
def register():
    """Register a new user."""
    schema = UserCreateSchema()
    
    # Validate input
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create user
    user = User(
        email=data['email'],
        username=data['username'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(UserSchema().dump(user)), 201


@api_bp.route('/auth/login', methods=['POST'])
@swag_from({
    'tags': ['Authentication'],
    'summary': 'User login',
    'description': 'Authenticate user and return JWT tokens',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'email': {'type': 'string', 'format': 'email'},
                    'password': {'type': 'string'},
                },
                'required': ['email', 'password']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Login successful',
            'schema': {
                'type': 'object',
                'properties': {
                    'access_token': {'type': 'string'},
                    'refresh_token': {'type': 'string'},
                    'token_type': {'type': 'string'},
                    'user': {'$ref': '#/definitions/User'}
                }
            }
        },
        401: {'description': 'Invalid credentials'}
    }
})
def login():
    """Authenticate user and return tokens."""
    schema = LoginSchema()
    
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 401
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer',
        'user': UserSchema().dump(user)
    }), 200


@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Refresh access token',
    'description': 'Get a new access token using refresh token',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Token refreshed',
            'schema': {
                'type': 'object',
                'properties': {
                    'access_token': {'type': 'string'},
                    'token_type': {'type': 'string'}
                }
            }
        },
        401: {'description': 'Invalid or expired refresh token'}
    }
})
def refresh():
    """Refresh access token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    
    return jsonify({
        'access_token': access_token,
        'token_type': 'Bearer'
    }), 200


@api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Authentication'],
    'summary': 'Get current user',
    'description': 'Get the currently authenticated user',
    'security': [{'Bearer': []}],
    'responses': {
        200: {
            'description': 'Current user data',
            'schema': {'$ref': '#/definitions/User'}
        },
        401: {'description': 'Unauthorized'}
    }
})
def get_current_user():
    """Get current authenticated user."""
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    return jsonify(UserSchema().dump(user)), 200




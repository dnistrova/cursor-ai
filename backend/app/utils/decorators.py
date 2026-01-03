"""Decorators for role-based access control and rate limiting."""
from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.user import User, UserRole


def require_role(*roles):
    """Decorator to require specific user roles.
    
    Usage:
        @require_role(UserRole.ADMIN)
        @require_role(UserRole.ADMIN, UserRole.AGENT)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found',
                    'code': 'UNAUTHORIZED'
                }), 401
            
            if not user.is_active:
                return jsonify({
                    'status': 'error',
                    'message': 'Account is disabled',
                    'code': 'FORBIDDEN'
                }), 403
            
            if user.role not in roles:
                return jsonify({
                    'status': 'error',
                    'message': 'Insufficient permissions',
                    'code': 'FORBIDDEN'
                }), 403
            
            # Store user in g for access in route
            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(fn):
    """Decorator to require admin role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({
                'status': 'error',
                'message': 'Admin access required',
                'code': 'FORBIDDEN'
            }), 403
        
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def agent_or_admin_required(fn):
    """Decorator to require agent or admin role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role not in [UserRole.AGENT, UserRole.ADMIN]:
            return jsonify({
                'status': 'error',
                'message': 'Agent or admin access required',
                'code': 'FORBIDDEN'
            }), 403
        
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def get_current_user():
    """Get current user from JWT token."""
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except Exception:
        return None


def set_current_user():
    """Decorator to set current user in g without role check."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found',
                    'code': 'UNAUTHORIZED'
                }), 401
            
            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator



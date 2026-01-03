"""Error handlers for the API."""
from flask import jsonify


def bad_request(error):
    """Handle 400 Bad Request errors."""
    return jsonify({
        'error': 'bad_request',
        'message': str(error.description) if hasattr(error, 'description') else 'Bad request'
    }), 400


def unauthorized(error):
    """Handle 401 Unauthorized errors."""
    return jsonify({
        'error': 'unauthorized',
        'message': str(error.description) if hasattr(error, 'description') else 'Unauthorized'
    }), 401


def forbidden(error):
    """Handle 403 Forbidden errors."""
    return jsonify({
        'error': 'forbidden',
        'message': str(error.description) if hasattr(error, 'description') else 'Forbidden'
    }), 403


def not_found(error):
    """Handle 404 Not Found errors."""
    return jsonify({
        'error': 'not_found',
        'message': str(error.description) if hasattr(error, 'description') else 'Resource not found'
    }), 404


def internal_error(error):
    """Handle 500 Internal Server errors."""
    return jsonify({
        'error': 'internal_server_error',
        'message': 'An unexpected error occurred'
    }), 500


class APIError(Exception):
    """Base API Exception."""
    
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload
    
    def to_dict(self):
        rv = dict(self.payload or ())
        rv['error'] = self.message
        return rv




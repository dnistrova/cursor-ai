"""Flask application factory."""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from flasgger import Swagger

from config import config

# Initialize extensions
db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
migrate = Migrate()


def create_app(config_name='default'):
    """Create and configure the Flask application.
    
    Args:
        config_name: Configuration environment name
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Initialize Swagger
    swagger_config = {
        'headers': [],
        'specs': [
            {
                'endpoint': 'apispec',
                'route': '/apispec.json',
                'rule_filter': lambda rule: True,
                'model_filter': lambda tag: True,
            }
        ],
        'static_url_path': '/flasgger_static',
        'swagger_ui': True,
        'specs_route': '/docs/'
    }
    Swagger(app, config=swagger_config, template={
        'info': {
            'title': 'Cursor AI API',
            'version': '1.0.0',
            'description': 'REST API for Cursor AI Application',
        },
        'securityDefinitions': {
            'Bearer': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header',
                'description': 'JWT Authorization header. Example: "Bearer {token}"'
            }
        },
        'security': [{'Bearer': []}]
    })
    
    # Register blueprints
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api/v1')
    
    # Root route - API welcome
    @app.route('/')
    def index():
        return {
            'status': 'success',
            'message': 'Cursor AI Full-Stack Application API',
            'version': '1.0.0',
            'documentation': '/docs/',
            'endpoints': {
                'authentication': {
                    'register': 'POST /api/v1/auth/register',
                    'login': 'POST /api/v1/auth/login',
                    'refresh': 'POST /api/v1/auth/refresh',
                    'me': 'GET /api/v1/auth/me',
                },
                'users': {
                    'list': 'GET /api/v1/users',
                    'get': 'GET /api/v1/users/<id>',
                    'update': 'PUT /api/v1/users/<id>',
                    'delete': 'DELETE /api/v1/users/<id>',
                },
                'tickets': {
                    'list': 'GET /api/v1/tickets',
                    'create': 'POST /api/v1/tickets',
                    'get': 'GET /api/v1/tickets/<id>',
                    'update': 'PUT /api/v1/tickets/<id>',
                    'delete': 'DELETE /api/v1/tickets/<id>',
                    'status': 'PUT /api/v1/tickets/<id>/status',
                    'priority': 'PUT /api/v1/tickets/<id>/priority',
                    'assign': 'POST /api/v1/tickets/<id>/assign',
                    'comments': 'GET/POST /api/v1/tickets/<id>/comments',
                    'history': 'GET /api/v1/tickets/<id>/history',
                },
                'blog': {
                    'posts': 'GET/POST /api/v1/posts',
                    'post': 'GET/PUT/DELETE /api/v1/posts/<id>',
                    'post_by_slug': 'GET /api/v1/posts/<slug>',
                    'comments': 'GET/POST /api/v1/posts/<id>/comments',
                    'delete_comment': 'DELETE /api/v1/comments/<id>',
                },
                'categories': {
                    'list': 'GET /api/v1/categories',
                    'create': 'POST /api/v1/categories',
                },
                'search': 'GET /api/v1/search?q=<keyword>',
                'health': 'GET /health',
            }
        }
    
    # Health check
    @app.route('/health')
    def health():
        return {'status': 'healthy'}
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register JWT callbacks
    register_jwt_callbacks(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app


def register_error_handlers(app):
    """Register error handlers."""
    from app.api.errors import (
        bad_request,
        unauthorized,
        forbidden,
        not_found,
        internal_error,
    )
    
    app.register_error_handler(400, bad_request)
    app.register_error_handler(401, unauthorized)
    app.register_error_handler(403, forbidden)
    app.register_error_handler(404, not_found)
    app.register_error_handler(500, internal_error)


def register_jwt_callbacks(app):
    """Register JWT callbacks."""
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            'error': 'token_expired',
            'message': 'The token has expired'
        }, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            'error': 'invalid_token',
            'message': 'Signature verification failed'
        }, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            'error': 'authorization_required',
            'message': 'Request does not contain an access token'
        }, 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return {
            'error': 'token_revoked',
            'message': 'The token has been revoked'
        }, 401




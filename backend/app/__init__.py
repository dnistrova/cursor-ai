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
            'message': 'Customer Support Ticket System API',
            'version': '1.0.0',
            'endpoints': {
                'docs': '/docs/',
                'api': '/api/v1/',
                'auth': {
                    'register': 'POST /api/v1/auth/register',
                    'login': 'POST /api/v1/auth/login',
                },
                'tickets': 'GET/POST /api/v1/tickets',
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




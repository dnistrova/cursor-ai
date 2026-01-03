"""API Blueprint and routes."""
from flask import Blueprint

api_bp = Blueprint('api', __name__)

# Import routes to register them
from app.api import auth, users, tickets, blog, admin


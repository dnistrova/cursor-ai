"""Authentication schemas."""
from marshmallow import Schema, fields, validate


class LoginSchema(Schema):
    """Schema for user login."""
    
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class TokenSchema(Schema):
    """Schema for JWT tokens."""
    
    access_token = fields.Str(required=True)
    refresh_token = fields.Str(required=True)
    token_type = fields.Str(dump_default='Bearer')
    expires_in = fields.Int()


class RefreshSchema(Schema):
    """Schema for token refresh."""
    
    refresh_token = fields.Str(required=True)




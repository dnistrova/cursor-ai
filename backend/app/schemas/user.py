"""User schemas for serialization and validation."""
from marshmallow import Schema, fields, validate, post_load, validates
from marshmallow.exceptions import ValidationError


class UserSchema(Schema):
    """Schema for user serialization."""
    
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    first_name = fields.Str(validate=validate.Length(max=50))
    last_name = fields.Str(validate=validate.Length(max=50))
    full_name = fields.Str(dump_only=True)
    avatar_url = fields.Url(allow_none=True)
    is_active = fields.Bool(dump_only=True)
    is_admin = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    last_login = fields.DateTime(dump_only=True)


class UserCreateSchema(Schema):
    """Schema for user creation."""
    
    email = fields.Email(required=True)
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=80)
    )
    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128)
    )
    first_name = fields.Str(validate=validate.Length(max=50))
    last_name = fields.Str(validate=validate.Length(max=50))
    
    @validates('password')
    def validate_password(self, value):
        """Validate password strength."""
        if not any(c.isupper() for c in value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in value):
            raise ValidationError('Password must contain at least one digit')


class UserUpdateSchema(Schema):
    """Schema for user updates."""
    
    email = fields.Email()
    username = fields.Str(validate=validate.Length(min=3, max=80))
    first_name = fields.Str(validate=validate.Length(max=50))
    last_name = fields.Str(validate=validate.Length(max=50))
    avatar_url = fields.Url(allow_none=True)
    
    # Password change
    current_password = fields.Str(load_only=True)
    new_password = fields.Str(
        load_only=True,
        validate=validate.Length(min=8, max=128)
    )




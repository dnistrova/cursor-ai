"""Task schemas for serialization and validation."""
from marshmallow import Schema, fields, validate


class TaskSchema(Schema):
    """Schema for task serialization."""
    
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(allow_none=True)
    status = fields.Str(
        validate=validate.OneOf(['todo', 'in-progress', 'done']),
        load_default='todo'
    )
    priority = fields.Str(
        validate=validate.OneOf(['low', 'medium', 'high', 'urgent']),
        load_default='medium'
    )
    due_date = fields.DateTime(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    user_id = fields.Int(dump_only=True)
    
    # Nested user info
    author = fields.Nested('UserSchema', only=['id', 'username', 'avatar_url'], dump_only=True)


class TaskCreateSchema(Schema):
    """Schema for task creation."""
    
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(allow_none=True)
    status = fields.Str(
        validate=validate.OneOf(['todo', 'in-progress', 'done']),
        load_default='todo'
    )
    priority = fields.Str(
        validate=validate.OneOf(['low', 'medium', 'high', 'urgent']),
        load_default='medium'
    )
    due_date = fields.DateTime(allow_none=True)


class TaskUpdateSchema(Schema):
    """Schema for task updates."""
    
    title = fields.Str(validate=validate.Length(min=1, max=200))
    description = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(['todo', 'in-progress', 'done']))
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high', 'urgent']))
    due_date = fields.DateTime(allow_none=True)




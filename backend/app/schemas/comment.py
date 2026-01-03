"""Comment schemas for serialization and validation."""
from marshmallow import Schema, fields, validate


class CommentSchema(Schema):
    """Schema for comment serialization."""
    
    id = fields.Int(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    task_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    parent_id = fields.Int(allow_none=True)
    reply_count = fields.Int(dump_only=True)
    
    # Nested
    user = fields.Nested('UserSchema', only=['id', 'username', 'avatar_url', 'full_name'], dump_only=True)
    replies = fields.Nested('CommentSchema', many=True, dump_only=True, exclude=['replies'])


class CommentCreateSchema(Schema):
    """Schema for comment creation."""
    
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))
    parent_id = fields.Int(allow_none=True)


class CommentUpdateSchema(Schema):
    """Schema for comment updates."""
    
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))




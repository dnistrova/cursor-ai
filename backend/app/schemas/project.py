"""Project schemas for serialization and validation."""
from marshmallow import Schema, fields, validate


class ProjectSchema(Schema):
    """Schema for project serialization."""
    
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)
    color = fields.Str(validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))
    icon = fields.Str(validate=validate.Length(max=50))
    status = fields.Str(
        validate=validate.OneOf(['active', 'archived', 'completed']),
        load_default='active'
    )
    visibility = fields.Str(
        validate=validate.OneOf(['private', 'team', 'public']),
        load_default='private'
    )
    start_date = fields.DateTime(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    completed_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    owner_id = fields.Int(dump_only=True)
    
    # Computed fields
    member_count = fields.Int(dump_only=True)
    task_count = fields.Int(dump_only=True)
    progress = fields.Int(dump_only=True)
    
    # Nested
    owner = fields.Nested('UserSchema', only=['id', 'username', 'avatar_url'], dump_only=True)
    members = fields.Nested('UserSchema', only=['id', 'username', 'avatar_url'], many=True, dump_only=True)


class ProjectCreateSchema(Schema):
    """Schema for project creation."""
    
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)
    color = fields.Str(
        validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'),
        load_default='#6366f1'
    )
    icon = fields.Str(load_default='folder')
    visibility = fields.Str(
        validate=validate.OneOf(['private', 'team', 'public']),
        load_default='private'
    )
    start_date = fields.DateTime(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    member_ids = fields.List(fields.Int(), load_default=[])


class ProjectUpdateSchema(Schema):
    """Schema for project updates."""
    
    name = fields.Str(validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)
    color = fields.Str(validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))
    icon = fields.Str(validate=validate.Length(max=50))
    status = fields.Str(validate=validate.OneOf(['active', 'archived', 'completed']))
    visibility = fields.Str(validate=validate.OneOf(['private', 'team', 'public']))
    start_date = fields.DateTime(allow_none=True)
    due_date = fields.DateTime(allow_none=True)


class ProjectMemberSchema(Schema):
    """Schema for adding/removing project members."""
    
    user_id = fields.Int(required=True)
    role = fields.Str(
        validate=validate.OneOf(['admin', 'member']),
        load_default='member'
    )




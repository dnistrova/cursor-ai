"""Notification schemas for serialization."""
from marshmallow import Schema, fields, validate


class NotificationSchema(Schema):
    """Schema for notification serialization."""
    
    id = fields.Int(dump_only=True)
    type = fields.Str(dump_only=True)
    title = fields.Str(dump_only=True)
    message = fields.Str(dump_only=True)
    data = fields.Dict(dump_only=True)
    is_read = fields.Bool(dump_only=True)
    read_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    user_id = fields.Int(dump_only=True)
    sender_id = fields.Int(dump_only=True)
    
    # Nested
    sender = fields.Nested('UserSchema', only=['id', 'username', 'avatar_url'], dump_only=True)


class NotificationUpdateSchema(Schema):
    """Schema for updating notification (mark as read)."""
    
    is_read = fields.Bool(required=True)


class NotificationBulkUpdateSchema(Schema):
    """Schema for bulk updating notifications."""
    
    notification_ids = fields.List(fields.Int(), required=True)
    is_read = fields.Bool(required=True)




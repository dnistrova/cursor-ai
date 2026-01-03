"""Ticket schemas for validation and serialization."""
from marshmallow import Schema, fields, validate, validates, validates_schema, post_load
from marshmallow.exceptions import ValidationError

from app.models.ticket import TicketStatus, TicketPriority, TicketCategory
from app.utils.validators import validate_email_rfc5322, validate_subject, validate_description, sanitize_html


class TicketSchema(Schema):
    """Schema for ticket serialization."""
    
    id = fields.Int(dump_only=True)
    ticket_number = fields.Str(dump_only=True)
    subject = fields.Str(required=True)
    description = fields.Str(required=True)
    status = fields.Str(dump_only=True)
    priority = fields.Str()
    category = fields.Str(required=True)
    customer_email = fields.Email(required=True)
    customer_id = fields.Int(dump_only=True)
    assigned_to_id = fields.Int(dump_only=True)
    
    # SLA fields
    first_response_at = fields.DateTime(dump_only=True)
    sla_response_due = fields.DateTime(dump_only=True)
    sla_resolution_due = fields.DateTime(dump_only=True)
    sla_breached = fields.Bool(dump_only=True)
    is_sla_response_breached = fields.Bool(dump_only=True)
    is_sla_resolution_breached = fields.Bool(dump_only=True)
    
    # Timestamps
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    resolved_at = fields.DateTime(dump_only=True)
    closed_at = fields.DateTime(dump_only=True)
    
    # Counts
    comment_count = fields.Int(dump_only=True)
    attachment_count = fields.Int(dump_only=True)
    
    # Nested
    customer = fields.Dict(dump_only=True)
    assigned_to = fields.Dict(dump_only=True)


class TicketCreateSchema(Schema):
    """Schema for creating a ticket."""
    
    subject = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=200)
    )
    description = fields.Str(
        required=True,
        validate=validate.Length(min=20, max=5000)
    )
    priority = fields.Str(
        validate=validate.OneOf(TicketPriority.ALL),
        load_default=TicketPriority.MEDIUM
    )
    category = fields.Str(
        required=True,
        validate=validate.OneOf(TicketCategory.ALL)
    )
    customer_email = fields.Email(required=True)
    
    @validates('subject')
    def validate_subject_content(self, value):
        """Validate subject content."""
        validate_subject(value)
    
    @validates('description')
    def validate_description_content(self, value):
        """Validate description content."""
        validate_description(value)
    
    @validates('customer_email')
    def validate_email(self, value):
        """Validate email format."""
        validate_email_rfc5322(value)
    
    @post_load
    def sanitize_content(self, data, **kwargs):
        """Sanitize user-generated content."""
        if 'subject' in data:
            data['subject'] = sanitize_html(data['subject'])
        if 'description' in data:
            data['description'] = sanitize_html(data['description'])
        return data


class TicketUpdateSchema(Schema):
    """Schema for updating a ticket."""
    
    subject = fields.Str(validate=validate.Length(min=5, max=200))
    description = fields.Str(validate=validate.Length(min=20, max=5000))
    category = fields.Str(validate=validate.OneOf(TicketCategory.ALL))
    
    @validates('subject')
    def validate_subject_content(self, value):
        """Validate subject content if provided."""
        if value:
            validate_subject(value)
    
    @validates('description')
    def validate_description_content(self, value):
        """Validate description content if provided."""
        if value:
            validate_description(value)
    
    @post_load
    def sanitize_content(self, data, **kwargs):
        """Sanitize user-generated content."""
        if 'subject' in data:
            data['subject'] = sanitize_html(data['subject'])
        if 'description' in data:
            data['description'] = sanitize_html(data['description'])
        return data


class TicketStatusUpdateSchema(Schema):
    """Schema for updating ticket status."""
    
    status = fields.Str(
        required=True,
        validate=validate.OneOf(TicketStatus.ALL)
    )
    reason = fields.Str(validate=validate.Length(max=500))


class TicketPriorityUpdateSchema(Schema):
    """Schema for updating ticket priority."""
    
    priority = fields.Str(
        required=True,
        validate=validate.OneOf(TicketPriority.ALL)
    )
    reason = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=500),
        error_messages={'required': 'Reason is required when changing priority'}
    )


class TicketAssignSchema(Schema):
    """Schema for assigning a ticket."""
    
    agent_id = fields.Int(required=True)


class TicketCommentSchema(Schema):
    """Schema for ticket comments."""
    
    id = fields.Int(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=1, max=5000))
    is_internal = fields.Bool(load_default=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    ticket_id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    user = fields.Dict(dump_only=True)
    attachments = fields.List(fields.Dict(), dump_only=True)
    
    @post_load
    def sanitize_content(self, data, **kwargs):
        """Sanitize comment content."""
        if 'content' in data:
            data['content'] = sanitize_html(data['content'])
        return data


class TicketCommentCreateSchema(Schema):
    """Schema for creating a ticket comment."""
    
    content = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=5000)
    )
    is_internal = fields.Bool(load_default=False)
    
    @post_load
    def sanitize_content(self, data, **kwargs):
        """Sanitize comment content."""
        if 'content' in data:
            data['content'] = sanitize_html(data['content'])
        return data


class TicketSearchSchema(Schema):
    """Schema for ticket search/filter parameters."""
    
    ticket_number = fields.Str()
    keyword = fields.Str()
    customer_email = fields.Email()
    status = fields.List(fields.Str(validate=validate.OneOf(TicketStatus.ALL)))
    priority = fields.List(fields.Str(validate=validate.OneOf(TicketPriority.ALL)))
    category = fields.List(fields.Str(validate=validate.OneOf(TicketCategory.ALL)))
    assigned_to_id = fields.Int()
    unassigned = fields.Bool()
    date_from = fields.DateTime()
    date_to = fields.DateTime()
    page = fields.Int(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Int(load_default=20, validate=validate.Range(min=1, max=100))
    sort_by = fields.Str(
        load_default='created_at',
        validate=validate.OneOf(['created_at', 'updated_at', 'priority', 'status'])
    )
    sort_order = fields.Str(
        load_default='desc',
        validate=validate.OneOf(['asc', 'desc'])
    )


class TicketHistorySchema(Schema):
    """Schema for ticket history entries."""
    
    id = fields.Int(dump_only=True)
    action = fields.Str(dump_only=True)
    old_value = fields.Str(dump_only=True)
    new_value = fields.Str(dump_only=True)
    details = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    user = fields.Dict(dump_only=True)



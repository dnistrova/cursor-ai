"""Background tasks package."""
from app.tasks.email_tasks import (
    send_ticket_created_email,
    send_ticket_assigned_email,
    send_status_changed_email,
    send_comment_notification_email,
    send_sla_warning_email,
)
from app.tasks.sla_tasks import (
    check_sla_breaches,
    escalate_ticket,
    calculate_sla_metrics,
)
from app.tasks.report_tasks import (
    generate_daily_report,
    generate_agent_performance_report,
    export_tickets_csv,
)

__all__ = [
    # Email tasks
    'send_ticket_created_email',
    'send_ticket_assigned_email',
    'send_status_changed_email',
    'send_comment_notification_email',
    'send_sla_warning_email',
    # SLA tasks
    'check_sla_breaches',
    'escalate_ticket',
    'calculate_sla_metrics',
    # Report tasks
    'generate_daily_report',
    'generate_agent_performance_report',
    'export_tickets_csv',
]



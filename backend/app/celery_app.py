"""Celery application configuration for background tasks."""
from celery import Celery

# Create Celery instance
celery = Celery('tasks')


def init_celery(app):
    """Initialize Celery with Flask app context."""
    celery.conf.update(
        broker_url=app.config.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        result_backend=app.config.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
        task_serializer='json',
        result_serializer='json',
        accept_content=['json'],
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=30 * 60,  # 30 minutes
        worker_prefetch_multiplier=1,
        task_acks_late=True,
        task_reject_on_worker_lost=True,
        # Task routes
        task_routes={
            'app.tasks.email.*': {'queue': 'email'},
            'app.tasks.sla.*': {'queue': 'sla'},
            'app.tasks.reports.*': {'queue': 'reports'},
        },
        # Beat schedule for periodic tasks
        beat_schedule={
            'check-sla-every-5-minutes': {
                'task': 'app.tasks.sla.check_sla_breaches',
                'schedule': 300.0,  # 5 minutes
            },
            'send-daily-report': {
                'task': 'app.tasks.reports.generate_daily_report',
                'schedule': 86400.0,  # 24 hours
                'options': {'queue': 'reports'}
            },
            'cleanup-old-tickets': {
                'task': 'app.tasks.maintenance.cleanup_old_tickets',
                'schedule': 86400.0,  # 24 hours
            },
        },
    )
    
    class ContextTask(celery.Task):
        """Task that runs within Flask app context."""
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    
    celery.Task = ContextTask
    return celery



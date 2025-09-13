from .base import BASE_DIR
from datetime import timedelta
import os

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",").strip()


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': os.environ.get("DATABASE_ENGINE"),
        'NAME': os.environ.get("DATABASE_NAME"),
    }
}


# simple jwt Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(seconds=int(os.environ.get("ACCESS_TOKEN_LIFETIME"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(seconds=int(os.environ.get("REFRESH_TOKEN_LIFETIME"))),
    "UPDATE_LAST_LOGIN": True,
    "SIGNING_KEY": os.environ.get("JWT_SIGNING_KEY"), # openssl rand --hex 64 -> use to generate Key


}


# CORS settings
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if os.environ.get("CORS_ALLOWED_ORIGINS") else []
# CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development; restrict in production


# Production Logging Configuration
ADMINS = [
    ('System Admin', os.environ.get('ADMIN_EMAIL', 'admin@example.com')),
]

# Email settings for error reporting
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@accountingsystem.com')
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Production Logging Overrides
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'prod_detailed': {
            'format': '{asctime} | {levelname} | {name} | PID:{process} | {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'prod_json': {
            'format': '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s", "module": "%(module)s", "function": "%(funcName)s", "line": %(lineno)d, "process": %(process)d, "thread": %(thread)d}',
            'datefmt': '%Y-%m-%dT%H:%M:%S',
        },
        'syslog': {
            'format': 'AccountingSystem: {name} {levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        # Production console handler (minimal output)
        'prod_console': {
            'level': 'WARNING',
            'class': 'logging.StreamHandler',
            'formatter': 'prod_detailed',
        },
        # Main application log
        'prod_file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'production.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 30,
            'formatter': 'prod_json',
        },
        # Error log
        'prod_error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'production_errors.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 60,
            'formatter': 'prod_detailed',
        },
        # Security log
        'prod_security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 90,
            'formatter': 'prod_detailed',
        },
        # API access log
        'prod_api_file': {
            'level': 'INFO',
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'api_access.log',
            'when': 'midnight',
            'interval': 1,
            'backupCount': 30,
            'formatter': 'prod_json',
        },
        # Email critical errors to admins
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'formatter': 'prod_detailed',
            'include_html': True,
        },
        # Syslog handler (if available)
        'syslog': {
            'level': 'INFO',
            'class': 'logging.handlers.SysLogHandler',
            'address': '/dev/log' if os.path.exists('/dev/log') else ('localhost', 514),
            'formatter': 'syslog',
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['prod_console', 'prod_file', 'syslog'],
    },
    'loggers': {
        'django': {
            'handlers': ['prod_file', 'prod_error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['prod_error_file', 'mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['prod_security_file', 'mail_admins'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['prod_error_file'],
            'level': 'ERROR',  # Only log DB errors in production
            'propagate': False,
        },
        'django.server': {
            'handlers': ['prod_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        # Application loggers
        'apps': {
            'handlers': ['prod_api_file', 'prod_error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'rest_framework': {
            'handlers': ['prod_api_file', 'prod_error_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'rest_framework_simplejwt': {
            'handlers': ['prod_security_file', 'prod_error_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        # Critical system logger
        'accounting_system.critical': {
            'handlers': ['prod_error_file', 'mail_admins', 'syslog'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# Additional production logging settings
LOGGING_CONFIG = None  # Disable Django's default logging configuration
import logging.config
logging.config.dictConfig(LOGGING)

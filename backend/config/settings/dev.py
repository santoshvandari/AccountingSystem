from .base import BASE_DIR
from datetime import timedelta
import os

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "insecure-dev-key")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "True") == "True"

ALLOWED_HOSTS = [os.environ.get("ALLOWED_HOSTS", "localhost").split(",")]


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': os.environ.get("DATABASE_ENGINE", "django.db.backends.sqlite3"),
        'NAME': BASE_DIR / os.environ.get("DATABASE_NAME", "db.sqlite3"),
    }
}


# simple jwt Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(seconds=int(os.environ.get("ACCESS_TOKEN_LIFETIME", 300))),
    "REFRESH_TOKEN_LIFETIME": timedelta(seconds=int(os.environ.get("REFRESH_TOKEN_LIFETIME", 900))),
    "SIGNING_KEY": os.environ.get("SIGNING_KEY", "<Use Strong in Production>"),  # ToDo: Use a more secure key in production


}


# CORS settings
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",  # React app running on localhost
# ]
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development; restrict in production


# Development Logging Overrides
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'dev_console': {
            'format': '🔍 {levelname} | {name} | {message}',
            'style': '{',
        },
        'dev_detailed': {
            'format': '{asctime} | {levelname} | {name} | {funcName}:{lineno} | {message}',
            'style': '{',
            'datefmt': '%H:%M:%S',
        },
    },
    'handlers': {
        'dev_console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'dev_console',
        },
        'dev_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'dev.log',
            'maxBytes': 1024*1024*5,  # 5 MB
            'backupCount': 2,
            'formatter': 'dev_detailed',
        },
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['dev_console', 'dev_file'],
    },
    'loggers': {
        'django': {
            'handlers': ['dev_console', 'dev_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['dev_console', 'dev_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['dev_file'],
            'level': 'INFO',  # Set to DEBUG to see SQL queries
            'propagate': False,
        },
        'django.server': {
            'handlers': ['dev_console'],
            'level': 'INFO',
            'propagate': False,
        },
        # App loggers for development
        'apps': {
            'handlers': ['dev_console', 'dev_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'rest_framework': {
            'handlers': ['dev_console', 'dev_file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Enable SQL query logging in development (uncomment if needed)
# import logging
# logging.getLogger('django.db.backends').setLevel(logging.DEBUG)

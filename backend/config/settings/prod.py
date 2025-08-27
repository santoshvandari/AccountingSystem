from base import BASE_DIR
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
    "SIGNING_KEY": os.environ.get("JWT_SIGNING_KEY"),
    # "SIGNING_KEY": "<Use Strong in Production>",  # ToDo: Use a more secure key in production


}


# CORS settings
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",").strip()
# CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development; restrict in production

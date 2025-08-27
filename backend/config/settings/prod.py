from base import BASE_DIR
from datetime import timedelta

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-b)8+v9vhk5&ik6=k8@@f7y5ug9o(3x8*1)45jt8yj)yghsb*ot'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# simple jwt Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=3),
    # "SIGNING_KEY": "<Use Strong in Production>",  # ToDo: Use a more secure key in production


}


# CORS settings
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",  # React app running on localhost
# ]
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development; restrict in production

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = 'django-insecure-your-secret-key-here'

# settings.py

RECAPTCHA_SECRET_KEY = "6LcOeCkrAAAAAEZxz6eI9xMSEzcW-u1hBolA_1Cn"  # Replace with your secret key

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'b574-2405-201-4018-6162-1c04-5bae-f2aa-34b.ngrok-free.app',  # new ngrok tunnel
    '.ngrok-free.app',  # Allow all ngrok domains
    'splendorous-melba-fc5384.netlify.app',  # Netlify frontend
    'devserver-main--splendorous-melba-fc5384.netlify.app',  # Netlify backend
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'user_session',
    'ai_agent',
    'django_extensions',  # For using Django extensions like shell_plus
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'user_session.middleware.CORSMiddleware',  # Updated to use the new class name
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'LLMediCare.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'LLMediCare.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins for testing
CORS_ALLOW_CREDENTIALS = True

# Keep these commented until we resolve the issue
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",  # Allow requests from React frontend running locally
#     "https://splendorous-melba-fc5384.netlify.app",  # Allow requests from Netlify
# ]

# Allow all headers and methods for testing
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# OpenAI API Key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
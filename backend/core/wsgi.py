import os
from django.core.wsgi import get_wsgi_application

# Configura el módulo de ajustes de Django para tu proyecto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
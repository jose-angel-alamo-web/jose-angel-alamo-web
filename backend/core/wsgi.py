"""WSGI entry point para despliegue en servidores compatibles.

Provee la variable `application` usada por servidores WSGI para cargar
la aplicación Django en entornos de producción o desarrollo.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
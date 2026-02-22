"""ASGI entry point para despliegues asincrónicos.

Provee la variable `application` usada por servidores ASGI  para servir la aplicación en entornos que requieren
soporte asíncrono.
"""

import os
from django.core.asgi import get_asgi_application


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_asgi_application()
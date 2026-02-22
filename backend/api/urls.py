"""Enrutado de la API para `api`.

Registra ViewSets y exporta las rutas del router por defecto.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticiaViewSet, ArchivoViewSet, CategoriaViewSet

router = DefaultRouter()
router.register(r'noticias', NoticiaViewSet)
router.register(r'archivos', ArchivoViewSet)
router.register(r'categorias', CategoriaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
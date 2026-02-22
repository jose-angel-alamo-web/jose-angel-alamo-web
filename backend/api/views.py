"""Vistas (ViewSets) exponiendo los endpoints REST.

Cada ViewSet es mínimo y usa permisos `IsAuthenticatedOrReadOnly`.
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Noticia, Archivo, Categoria
from .serializers import NoticiaSerializer, ArchivoSerializer, CategoriaSerializer


class NoticiaViewSet(viewsets.ModelViewSet):
    """CRUD de `Noticia`. Lista ordenada por `fecha_publicacion` descendente."""
    queryset = Noticia.objects.all().order_by('-fecha_publicacion')
    serializer_class = NoticiaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 


class ArchivoViewSet(viewsets.ModelViewSet):
    """CRUD de `Archivo`. Lista ordenada por `fecha_subida` descendente."""
    queryset = Archivo.objects.all().order_by('-fecha_subida')
    serializer_class = ArchivoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CategoriaViewSet(viewsets.ModelViewSet):
    """CRUD de `Categoria` con permisos de lectura pública."""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
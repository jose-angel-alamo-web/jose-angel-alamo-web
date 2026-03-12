from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly 
from .models import Noticia, Archivo, Categoria, RegistroInscripcion
from .serializers import NoticiaSerializer, ArchivoSerializer, CategoriaSerializer, RegistroInscripcionSerializer

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticia.objects.all().order_by('-fecha_publicacion')
    serializer_class = NoticiaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 

class ArchivoViewSet(viewsets.ModelViewSet):
    queryset = Archivo.objects.all().order_by('-fecha_subida')
    serializer_class = ArchivoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class RegistroInscripcionViewSet(viewsets.ModelViewSet):
    queryset = RegistroInscripcion.objects.all().order_by('-id')
    serializer_class = RegistroInscripcionSerializer

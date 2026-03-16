from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly 
from .models import Noticia, Auditoria, Archivo, Categoria, TipoArchivo, Grado, RegistroInscripcion
from .serializers import (NoticiaSerializer, ArchivoSerializer, CategoriaSerializer, 
                          TipoArchivoSerializer, GradoSerializer, RegistroInscripcionSerializer)

from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny



class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        # El .strip() elimina espacios accidentales al inicio o al final
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        
        if not username or not password:
            return Response({"error": "Por favor, ingresa un usuario y contraseña."}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Este nombre de usuario ya está en uso."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, password=password)
        
        user.is_active = True
        user.save()
        
        return Response({"mensaje": "Cuenta creada con éxito. Ahora puedes iniciar sesión."}, status=status.HTTP_201_CREATED)

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class TipoArchivoViewSet(viewsets.ModelViewSet):
    queryset = TipoArchivo.objects.all()
    serializer_class = TipoArchivoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticia.objects.all().order_by('-fecha_publicacion')
    serializer_class = NoticiaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] 

class ArchivoViewSet(viewsets.ModelViewSet):
    queryset = Archivo.objects.all().order_by('-fecha_subida')
    serializer_class = ArchivoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class RegistroInscripcionViewSet(viewsets.ModelViewSet):
    queryset = RegistroInscripcion.objects.all().order_by('-id')
    serializer_class = RegistroInscripcionSerializer

class RegistroInscripcionViewSet(viewsets.ModelViewSet):
    queryset = RegistroInscripcion.objects.all().order_by('-id')
    serializer_class = RegistroInscripcionSerializer
    permission_classes = [IsAuthenticated] 

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def get_queryset(self):
        if self.request.user.is_staff:
            return RegistroInscripcion.objects.all()
        return RegistroInscripcion.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        inscripcion = serializer.save(usuario=self.request.user)
        
        # Crea el registro de auditoría
        Auditoria.objects.create(
            usuario=self.request.user,
            accion='CREACIÓN',
            tabla_afectada='RegistroInscripcion',
            descripcion=f'El usuario creó una nueva inscripción para la cédula {inscripcion.estudiante.cedula}')
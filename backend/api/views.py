from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly 
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import Noticia, Auditoria, Archivo, Categoria, TipoArchivo, Grado, RegistroInscripcion, PreguntaSeguridad, RespuestaSeguridad
from .serializers import (NoticiaSerializer, ArchivoSerializer, CategoriaSerializer, 
                          TipoArchivoSerializer, GradoSerializer, RegistroInscripcionSerializer, PreguntaSeguridadSerializer)
        
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# serializador personalizado para el dmin
class AdminTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # primero valida que el usuario y contraseña sean correctos
        data = super().validate(attrs)
        
        # Luego verifica el ROL
        if not self.user.is_staff:
            raise AuthenticationFailed("Acceso denegado. Esta cuenta no tiene privilegios de administrador.")
            
        return data

# vista que usa ese serializador
class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminTokenSerializer

class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        respuestas = request.data.get('respuestas', []) # Nuevo: Esperamos un array de respuestas
        
        if not username or not password:
            return Response({"error": "Por favor, ingresa un usuario y contraseña."}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(respuestas) != 2:
            return Response({"error": "Debe proporcionar exactamente 2 preguntas de seguridad con sus respuestas."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Este nombre de usuario ya está en uso."}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, password=password)
        user.is_active = True
        user.save()

        # Guardar las respuestas de seguridad
        for item in respuestas:
            pregunta = get_object_or_404(PreguntaSeguridad, id=item['pregunta_id'])
            RespuestaSeguridad.objects.create(
                usuario=user,
                pregunta=pregunta,
                respuesta=item['respuesta'].strip().lower() # Guardamos en minúscula para la validación
            )
        
        return Response({"mensaje": "Cuenta creada con éxito. Ahora puedes iniciar sesión."}, status=status.HTTP_201_CREATED)
    
class PreguntasSeguridadView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        preguntas = PreguntaSeguridad.objects.all()
        serializer = PreguntaSeguridadSerializer(preguntas, many=True)
        return Response(serializer.data)

# 3. VISTAS PARA RECUPERACIÓN DE CONTRASEÑA
@api_view(['POST'])
@permission_classes([AllowAny])
def obtener_preguntas_usuario(request):
    username = request.data.get('username', '').strip()
    user = User.objects.filter(username=username).first()
    
    if not user:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
    respuestas_usuario = RespuestaSeguridad.objects.filter(usuario=user)
    if respuestas_usuario.count() < 2:
        return Response({"error": "Este usuario no tiene preguntas de seguridad configuradas."}, status=status.HTTP_400_BAD_REQUEST)
        
    preguntas_data = [
        {"id": resp.pregunta.id, "pregunta": resp.pregunta.pregunta} 
        for resp in respuestas_usuario
    ]
    return Response({"preguntas": preguntas_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def restablecer_password(request):
    username = request.data.get('username', '').strip()
    respuestas = request.data.get('respuestas', []) 
    new_password = request.data.get('new_password', '').strip()
    
    user = User.objects.filter(username=username).first()
    if not user:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
    if len(new_password) < 6:
        return Response({"error": "La nueva contraseña debe tener al menos 6 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

    # Validar respuestas
    respuestas_correctas = 0
    for item in respuestas:
        resp_db = RespuestaSeguridad.objects.filter(usuario=user, pregunta_id=item['pregunta_id']).first()
        if resp_db and resp_db.respuesta == item['respuesta'].strip().lower():
            respuestas_correctas += 1
            
    if respuestas_correctas == 2:
        user.set_password(new_password)
        user.save()
        return Response({"mensaje": "Contraseña restablecida exitosamente."})
    else:
        return Response({"error": "Las respuestas de seguridad son incorrectas."}, status=status.HTTP_400_BAD_REQUEST)

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
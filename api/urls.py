from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (NoticiaViewSet, ArchivoViewSet, CategoriaViewSet, 
                    TipoArchivoViewSet, GradoViewSet, RegistroInscripcionViewSet, RegistroUsuarioView)

router = DefaultRouter()
router.register(r'noticias', NoticiaViewSet)
router.register(r'archivos', ArchivoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'tipos-archivo', TipoArchivoViewSet)
router.register(r'grados', GradoViewSet)
router.register(r'registro-inscripciones', RegistroInscripcionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', RegistroUsuarioView.as_view(), name='registro_usuario')
]
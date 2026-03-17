from django.contrib import admin
from .models import Noticia, Archivo, Categoria, TipoArchivo, Grado, Estudiante, RegistroInscripcion, Auditoria, PreguntaSeguridad, RespuestaSeguridad

admin.site.register(Categoria)
admin.site.register(TipoArchivo)
admin.site.register(Grado)
admin.site.register(Estudiante)
admin.site.register(Noticia)
admin.site.register(Archivo)
admin.site.register(RegistroInscripcion)
admin.site.register(Auditoria)
admin.site.register(PreguntaSeguridad)
admin.site.register(RespuestaSeguridad)
from django.contrib import admin
from .models import Noticia, Archivo, Categoria

admin.site.register(Noticia)
admin.site.register(Archivo)
admin.site.register(Categoria)
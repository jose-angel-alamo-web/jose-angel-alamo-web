"""Serializadores de la API (DRF).

"""

from rest_framework import serializers
from .models import Noticia, Archivo, Categoria


class CategoriaSerializer(serializers.ModelSerializer):
    """Serializa el modelo `Categoria` con todos sus campos."""
    class Meta:
        model = Categoria
        fields = '__all__'


class NoticiaSerializer(serializers.ModelSerializer):
    """Serializa `Noticia` y añade el nombre de la categoría."""

    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')

    class Meta:
        model = Noticia
        fields = '__all__'


class ArchivoSerializer(serializers.ModelSerializer):
    """Serializa `Archivo` e incluye el tamaño formateado del archivo."""
    size_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Archivo
        fields = ['id', 'titulo', 'categoria', 'archivo_pdf', 'fecha_subida', 'size_formatted']

    def get_size_formatted(self, obj):
        """Devuelve el tamaño de `archivo_pdf` formateado en KB o MB."""
        try:
            size = obj.archivo_pdf.size
            if size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            return f"{size / (1024 * 1024):.1f} MB"
        except:
            return "0 KB"
"""Modelos de la aplicación `api`.

Este módulo define los modelos principales usados por la API:
- `Categoria`: categorías de noticias.
- `Noticia`: noticias/publicaciones.
- `Archivo`: archivos o planillas subidas (PDFs).

"""

from django.db import models


class Categoria(models.Model):
    """Categoría para agrupar noticias.

    Atributos:
    - nombre (CharField): nombre visible de la categoría.

    Uso:
    - Se utiliza como FK desde `Noticia` para clasificar noticias.
    """
    nombre = models.CharField(max_length=100)

    def __str__(self):
        """Retorna el nombre legible de la categoría."""
        return self.nombre


class Noticia(models.Model):
    """Modelo que representa una noticia o entrada de blog.

    Atributos principales:
    - titulo (CharField): título de la noticia.
    - contenido (TextField): cuerpo/descripcion de la noticia.
    - categoria (ForeignKey): relación con `Categoria`.
    - imagen (ImageField): imagen opcional asociada a la noticia.
    - fecha_publicacion (DateTimeField): fecha de creación (auto_now_add).

    Uso:
    - Endpoints de la API consumen instancias de este modelo para listar,
      crear o modificar noticias.
    """
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='noticias/', null=True, blank=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Retorna el título de la noticia como representación legible."""
        return self.titulo


class Archivo(models.Model):
    """Representa archivos (planillas, documentos) subidos al sistema.

    Atributos principales:
    - CATEGORIAS_OPCIONES (list): opciones de categoría para clasificar el archivo.
    - titulo (CharField): título descriptivo del archivo.
    - categoria (CharField): categoría elegida (de las opciones).
    - archivo_pdf (FileField): archivo almacenado (se espera PDF).
    - fecha_subida (DateTimeField): fecha y hora de subida (auto_now_add).

    Uso:
    - Permite almacenar y listar planillas y documentos que los usuarios
      pueden descargar desde el frontend.
    """
    CATEGORIAS_OPCIONES = [
        ('Planilla reingreso', 'Planilla reingreso'),
        ('Planilla nuevo ingreso', 'Planilla nuevo ingreso'),
        ('Otro', 'Otro'),
    ]

    titulo = models.CharField(max_length=200)
    categoria = models.CharField(max_length=50, choices=CATEGORIAS_OPCIONES, default='Otro')
    archivo_pdf = models.FileField(upload_to='planillas/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Retorna el título del archivo como representación legible."""
        return self.titulo
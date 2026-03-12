from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    def __str__(self): return self.nombre

class Noticia(models.Model):
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='noticias/', null=True, blank=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.titulo

class Archivo(models.Model):
    # Define las opciones 
    CATEGORIAS_OPCIONES = [
        ('Planilla reingreso', 'Planilla reingreso'),
        ('Planilla nuevo ingreso', 'Planilla nuevo ingreso'),
        ('Otro', 'Otro'),
    ]

    titulo = models.CharField(max_length=200)
    categoria = models.CharField(max_length=50, choices=CATEGORIAS_OPCIONES, default='Otro')
    archivo_pdf = models.FileField(upload_to='planillas/') # Se guardarán en media/planillas/
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

class RegistroInscripcion(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    cedula = models.CharField(max_length=20)
    archivo_pdf = models.FileField(upload_to='registro-inscripciones/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    grado_cursar = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.cedula}"

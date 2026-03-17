from django.db import models
from django.contrib.auth.models import User


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    
    def __str__(self): 
        return self.nombre

class TipoArchivo(models.Model):
    """Reemplaza a CATEGORIAS_OPCIONES para hacerlo dinámico y escalable"""
    nombre = models.CharField(max_length=100) 
    
    def __str__(self): 
        return self.nombre

class Grado(models.Model):
    """Maneja los grados para evitar errores tipográficos en los registros"""
    nombre = models.CharField(max_length=50) 
    
    def __str__(self): 
        return self.nombre

class Estudiante(models.Model):
    """Extraído para cumplir con la 3NF. Los datos de la persona existen 1 sola vez."""
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)

    def __str__(self): 
        return f"{self.nombre} {self.apellido} - {self.cedula}"


class Noticia(models.Model):
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='noticias/', null=True, blank=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self): 
        return self.titulo

class Archivo(models.Model):
    titulo = models.CharField(max_length=200)
    tipo_archivo = models.ForeignKey(TipoArchivo, on_delete=models.SET_NULL, null=True)
    archivo_pdf = models.FileField(upload_to='planillas/') 
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

class RegistroInscripcion(models.Model):
    # Claves foráneas que conectan la inscripción con el estudiante y el grado
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    grado_cursar = models.ForeignKey(Grado, on_delete=models.SET_NULL, null=True)
    
    archivo_pdf = models.FileField(upload_to='registro-inscripciones/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inscripción: {self.estudiante.cedula} - Grado: {self.grado_cursar}"
    
class RegistroInscripcion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inscripciones', null=True) 
    
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    grado_cursar = models.ForeignKey(Grado, on_delete=models.SET_NULL, null=True)
    
    archivo_pdf = models.FileField(upload_to='registro-inscripciones/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inscripción: {self.estudiante.cedula} - Usuario: {self.usuario.username}"
    
class Auditoria(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    accion = models.CharField(max_length=50) # Ej: 'CREACIÓN', 'EDICIÓN', 'ELIMINACIÓN'
    tabla_afectada = models.CharField(max_length=50) 
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        username = self.usuario.username if self.usuario else "Sistema"
        return f"[{self.fecha.strftime('%Y-%m-%d %H:%M')}] {username} - {self.accion} en {self.tabla_afectada}"

class PreguntaSeguridad(models.Model):
    pregunta = models.CharField(max_length=200)

    def __str__(self):
        return self.pregunta

class RespuestaSeguridad(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='respuestas_seguridad')
    pregunta = models.ForeignKey(PreguntaSeguridad, on_delete=models.CASCADE)
    respuesta = models.CharField(max_length=200) # Se guardará en minúsculas para evitar errores tipográficos

    def __str__(self):
        return f"{self.usuario.username} - {self.pregunta.pregunta}"
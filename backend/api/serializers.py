from rest_framework import serializers
from .models import Noticia, Archivo, Categoria, TipoArchivo, Grado, Estudiante, RegistroInscripcion, PreguntaSeguridad

# --- Serializadores Catálogo ---
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class TipoArchivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoArchivo
        fields = '__all__'

class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__'

# --- Serializadores Principales ---
class NoticiaSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')

    class Meta:
        model = Noticia
        fields = '__all__'

class ArchivoSerializer(serializers.ModelSerializer):
    size_formatted = serializers.SerializerMethodField()
    # Para mostrar el nombre del tipo de archivo y no solo el ID 
    tipo_archivo_nombre = serializers.ReadOnlyField(source='tipo_archivo.nombre') 

    class Meta:
        model = Archivo
        fields = ['id', 'titulo', 'tipo_archivo', 'tipo_archivo_nombre', 'archivo_pdf', 'fecha_subida', 'size_formatted']

    def get_size_formatted(self, obj):
        try:
            size = obj.archivo_pdf.size
            if size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            return f"{size / (1024 * 1024):.1f} MB"
        except:
            return "0 KB"

class RegistroInscripcionSerializer(serializers.ModelSerializer):
    # Campos "virtuales" solo de escritura para recibir datos del formulario de React
    cedula = serializers.CharField(write_only=True)
    nombre = serializers.CharField(write_only=True)
    apellido = serializers.CharField(write_only=True)

    # Campos de solo lectura para devolver al frontend cuando consulte las inscripciones
    estudiante_info = serializers.SerializerMethodField(read_only=True)
    grado_nombre = serializers.ReadOnlyField(source='grado_cursar.nombre')

    class Meta:
        model = RegistroInscripcion
        fields = ['id', 'cedula', 'nombre', 'apellido', 'grado_cursar', 'grado_nombre', 'archivo_pdf', 'fecha_subida', 'estudiante_info']

    def get_estudiante_info(self, obj):
        return {
            "cedula": obj.estudiante.cedula,
            "nombre": obj.estudiante.nombre,
            "apellido": obj.estudiante.apellido
        }

    def create(self, validated_data):
        cedula = validated_data.pop('cedula')
        nombre = validated_data.pop('nombre')
        apellido = validated_data.pop('apellido')

        estudiante, created = Estudiante.objects.get_or_create(
            cedula=cedula,
            defaults={'nombre': nombre, 'apellido': apellido}
        )
        
        if not created and (estudiante.nombre != nombre or estudiante.apellido != apellido):
            estudiante.nombre = nombre
            estudiante.apellido = apellido
            estudiante.save()
        inscripcion = RegistroInscripcion.objects.create(estudiante=estudiante, **validated_data)
        return inscripcion
    
class PreguntaSeguridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaSeguridad
        fields = ['id', 'pregunta']
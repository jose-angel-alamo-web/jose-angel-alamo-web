Plataforma Web Institucional - U.E.N José Ángel Álamo
Este repositorio contiene el código fuente de la plataforma web oficial y el sistema de gestión de contenidos de la Unidad Educativa Nacional José Ángel Álamo.

El sistema ha sido diseñado como una solución integral para modernizar la comunicación institucional. Permite la publicación dinámica de noticias, la distribución de documentos oficiales (planillas de inscripción y constancias) y proporciona una interfaz pública accesible para estudiantes y representantes.

 Arquitectura Tecnológica
El proyecto está construido bajo una arquitectura cliente-servidor separada, garantizando escalabilidad y un mantenimiento eficiente.

Frontend (Cliente): Desarrollado con React y empaquetado con Vite. La interfaz de usuario utiliza Tailwind CSS para un diseño responsivo y moderno, integrando la librería lucide-react para la iconografía y react-router-dom para la navegación interna. Desplegado en Vercel.

Backend (Servidor/API): Construido con Python y Django, utilizando Django REST Framework para proveer una API RESTful que alimenta al cliente. Desplegado en PythonAnywhere.

Base de Datos: Relacional, gestionada a través del ORM de Django (SQLite/PythonAnywhere).

 Características Principales
Portal Público (Frontend)
Cartelera Informativa: Visualización en tiempo real de noticias y comunicados oficiales.

Zona de Descargas: Sistema de filtrado automático que permite a los usuarios descargar planillas PDF categorizadas (Nuevo Ingreso, Estudiantes Regulares, Otros).

Diseño Responsivo: Adaptable a dispositivos móviles, tablets y equipos de escritorio.

Panel Administrativo (Backend/CMS)
Autenticación Segura: Acceso restringido mediante validación de Tokens (Token Authentication).

Recuperación de Acceso: Sistema integrado de restablecimiento de contraseñas vía correo electrónico (SMTP Gmail).

Gestor de Noticias: Editor de texto enriquecido integrado que permite redactar comunicados con formato (negritas, cursivas, listas, encabezados) y adjuntar imágenes de portada.

Gestor de Documentos: Módulo para la subida segura de archivos PDF (límite configurado de 5MB) con asignación automática de categorías para su posterior distribución en el portal público.

 Instalación y Configuración Local
Para ejecutar este proyecto en un entorno de desarrollo local, siga los siguientes pasos:

1. Configuración del Backend (Django)
Bash
# Clonar el repositorio
git clone https://github.com/jose-angel-alamo-web/jose-angel-alamo-web.git
cd backend

# Crear y activar el entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones a la base de datos
python manage.py migrate

# Crear el superusuario (Administrador)
python manage.py createsuperuser

# Iniciar el servidor de desarrollo
python manage.py runserver


2. Configuración del Frontend (React)
En una nueva terminal:

Bash
cd frontend

# Instalar dependencias de Node
npm install

# Iniciar el servidor de desarrollo
npm run dev

Variables de Entorno
Para el correcto funcionamiento del sistema en producción, el servidor backend requiere la configuración de las siguientes variables:

SECRET_KEY: Clave de seguridad de Django.

EMAIL_HOST_USER: Dirección de correo electrónico institucional utilizada para enviar las recuperaciones de contraseña.

EMAIL_HOST_PASSWORD: Contraseña de aplicación (App Password) generada desde los ajustes de seguridad de Google.

CORS_ALLOWED_ORIGINS / ALLOWED_HOSTS: Dominios autorizados para realizar peticiones a la API (URL de Vercel).

Manual de Usuario Admin
https://drive.google.com/file/d/1RGrFfS-PquWdlnNa_PdD7bhJuaj00GNC/view?usp=sharing



Licencia
Desarrollado como proyecto académico e institucional para la U.E.N José Ángel Álamo.

"""Rutas principales del proyecto.

Registra el panel de `admin`, las rutas de la app `api`, el endpoint
para obtención de token y las vistas para el flujo de restablecimiento
de contraseña (password reset).
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken import views 
from django.contrib.auth import views as auth_views

urlpatterns = [
    # --- RUTAS PRINCIPALES ---
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), 
    
    path('api-token-auth/', views.obtain_auth_token), 

    
    # 1. Formulario para pedir el correo
    path('reset_password/', 
         auth_views.PasswordResetView.as_view(template_name="password_reset.html"), 
         name ='reset_password'),

    # 2. Mensaje de "Correo enviado"
    path('reset_password_sent/', 
        auth_views.PasswordResetDoneView.as_view(template_name="password_reset_sent.html"), 
        name ='password_reset_done'),

    # 3. Link que llega al correo (para poner la nueva clave)
    path('reset/<uidb64>/<token>/', 
     auth_views.PasswordResetConfirmView.as_view(template_name="password_reset_form.html"), 
     name ='password_reset_confirm'),

    # 4. Mensaje de "Éxito, clave cambiada"
    path('reset_password_complete/', 
        auth_views.PasswordResetCompleteView.as_view(template_name="password_reset_done.html"), 
        name ='password_reset_complete'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
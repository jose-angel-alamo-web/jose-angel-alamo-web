from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken import views 
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # --- RUTAS PRINCIPALES ---
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), 

    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api-token-auth/', views.obtain_auth_token), 

    path('reset_password/', 
         auth_views.PasswordResetView.as_view(template_name="password_reset.html"), 
         name ='reset_password'),
    path('reset_password_sent/', 
        auth_views.PasswordResetDoneView.as_view(template_name="password_reset_sent.html"), 
        name ='password_reset_done'),

    path('reset/<uidb64>/<token>/', 
     auth_views.PasswordResetConfirmView.as_view(template_name="password_reset_form.html"), 
     name ='password_reset_confirm'),

    path('reset_password_complete/', 
        auth_views.PasswordResetCompleteView.as_view(template_name="password_reset_done.html"), 
        name ='password_reset_complete'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
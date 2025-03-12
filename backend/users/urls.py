from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    HealthcareProfessionalViewSet,
    PatientProfileViewSet
)

router = DefaultRouter()
router.register(r'healthcare-professionals', HealthcareProfessionalViewSet)
router.register(r'patient-profiles', PatientProfileViewSet)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]

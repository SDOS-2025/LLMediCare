from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SessionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')  # Using basename to avoid conflicts
router.register(r'sessions', SessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
    path('users/<str:email>/', UserViewSet.as_view({'get': 'retrieve', 'patch': 'update', 'delete': 'destroy'}), name='user-detail'),
]

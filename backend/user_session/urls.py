from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SessionViewSet
from .views import get_records,add_medication,add_medical_record,add_document
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')  # Using basename to avoid conflicts
router.register(r'sessions', SessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
    path('users/<str:email>/', UserViewSet.as_view({'get': 'retrieve', 'patch': 'update', 'delete': 'destroy'}), name='user-detail'),
    path('list/', get_records, name='get_records'),
    path('add_medication/', add_medication, name='add_medication'),
    path('add_medical_record/', add_medical_record, name='add_medical_record'),
    path('add_document/', add_document, name='add_document'),
]

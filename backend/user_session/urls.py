from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SessionViewSet
from .views import get_records, add_medication, add_medical_record, add_document

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')  # Using basename to avoid conflicts
router.register(r'sessions', SessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
    path('users/<str:email>/', UserViewSet.as_view({'get': 'retrieve', 'patch': 'update', 'delete': 'destroy'}), name='user-detail'),
    path('sessions/<int:pk>/add_chat/', SessionViewSet.as_view({'post': 'add_chat'}), name='session-add-chat'),
    path('sessions/<int:pk>/clear_chats/', SessionViewSet.as_view({'delete': 'clear_chats'}), name='session-clear-chats'),
    path('sessions/', SessionViewSet.as_view({'get': 'user_sessions'}), name='user-sessions'),
    path('list/', get_records, name='get_records'),
    path('add_medication/', add_medication, name='add_medication'),
    path('add_medical_record/', add_medical_record, name='add_medical_record'),
    path('add_document/', add_document, name='add_document'),
]

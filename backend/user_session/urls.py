from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, SessionViewSet, get_records, get_user_records,
    add_medication, add_medical_record, add_document,
    patient_upload_document, doctor_upload_document,
    AppointmentViewSet, MedicalRecordViewSet, DocumentViewSet, MedicationViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    # User related paths
    path('users/<str:email>/', UserViewSet.as_view({'get': 'retrieve', 'patch': 'update', 'delete': 'destroy'}), name='user-detail'),
    path('doctors/list/', UserViewSet.as_view({'get': 'doctors'}), name='doctors-list'),
    
    # Session paths
    path('sessions/<int:pk>/add_chat/', SessionViewSet.as_view({'post': 'add_chat'}), name='session-add-chat'),
    path('sessions/<int:pk>/clear_chats/', SessionViewSet.as_view({'delete': 'clear_chats'}), name='session-clear-chats'),
    path('sessions/', SessionViewSet.as_view({'get': 'user_sessions'}), name='user-sessions'),
    
    # Records paths
    path('records/', get_records, name='get_records'),
    path('records/user/', get_user_records, name='get_user_records'),
    path('records/add_medication/', add_medication, name='add_medication'),
    path('records/add_medical_record/', add_medical_record, name='add_medical_record'),
    path('records/add_document/<str:user_email>/', add_document, name='add_document'),
    
    # Appointment paths
    path('appointments/', AppointmentViewSet.as_view({'post': 'create'}), name='appointments-list'),
    path('appointments/user/<str:email>/', AppointmentViewSet.as_view({'get': 'list'}), name='user-appointments'),
    path('appointments/<int:pk>/add_medical_record/', AppointmentViewSet.as_view({'post': 'add_medical_record'}), name='appointment-add-medical-record'),
    path('appointments/<int:pk>/add_medication/', AppointmentViewSet.as_view({'post': 'add_medication'}), name='appointment-add-medication'),
    
    # Document upload paths
    path('documents/patient/upload/', patient_upload_document, name='patient-upload-document'),
    path('documents/doctor/upload/', doctor_upload_document, name='doctor-upload-document'),

    path('notifications/', NotificationViewSet.as_view({'post': 'create_notification'}), name='create-notification'),
    path('notifications/unread/', NotificationViewSet.as_view({'get': 'unread'}), name='unread-notifications'),
    path('notifications/mark-all-read/', NotificationViewSet.as_view({'patch': 'mark_all_read'}), name='mark-all-notifications-read'),
    path('notifications/<int:pk>/mark-read/', NotificationViewSet.as_view({'patch': 'mark_read'}), name='mark-notification-read'),
    path('generate-medication-reminders/', NotificationViewSet.as_view({'get': 'generate_medication_reminders'}), name='generate-medication-reminders'),
]


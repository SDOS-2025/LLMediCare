from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicalRecordViewSet,
    MedicalDocumentViewSet,
    MedicationViewSet,
    MedicationReminderViewSet
)

router = DefaultRouter()
router.register(r'records', MedicalRecordViewSet, basename='medical-record')
router.register(r'documents', MedicalDocumentViewSet, basename='medical-document')
router.register(r'medications', MedicationViewSet, basename='medication')
router.register(r'reminders', MedicationReminderViewSet, basename='medication-reminder')

urlpatterns = [
    path('', include(router.urls)),
]

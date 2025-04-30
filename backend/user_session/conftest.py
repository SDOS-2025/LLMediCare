import pytest
from rest_framework.test import APIClient
from django.utils import timezone
from .models import User, Session, MedicalRecord, Document, Medication, Appointment, Notification
from .factories import (
    UserFactory, DoctorFactory, SessionFactory, MedicalRecordFactory, 
    DocumentFactory, MedicationFactory, AppointmentFactory, NotificationFactory
)

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def patient():
    return UserFactory(role='patient')

@pytest.fixture
def doctor():
    return DoctorFactory()

@pytest.fixture
def session(patient):
    return SessionFactory(user_email=patient)

@pytest.fixture
def session_with_chats(session):
    session.session_chats = [
        {'role': 'user', 'content': 'Hello'},
        {'role': 'assistant', 'content': 'How can I help you?'}
    ]
    session.save()
    return session

@pytest.fixture
def medical_record(patient):
    return MedicalRecordFactory(user=patient)

@pytest.fixture
def document(patient):
    return DocumentFactory(user=patient)

@pytest.fixture
def medication(patient):
    return MedicationFactory(user=patient)

@pytest.fixture
def appointment(patient, doctor):
    return AppointmentFactory(patient=patient, doctor=doctor)

@pytest.fixture
def notification(patient):
    return NotificationFactory(user=patient)

@pytest.fixture
def read_notification(patient):
    return NotificationFactory(user=patient, read=True)
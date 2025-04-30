from rest_framework.test import APIClient, APITestCase
from django.urls import reverse
from .models import User, Session, MedicalRecord, Document, Medication, Appointment, Notification
from .factory_utils import (
    UserFactory, DoctorFactory, SessionFactory, MedicalRecordFactory, 
    DocumentFactory, MedicationFactory, AppointmentFactory, NotificationFactory
)

class UserMixin:
    """Mixin for tests that need users (doctor and patient)"""
    
    def setup_users(self):
        self.patient = UserFactory()
        self.doctor = DoctorFactory()
        self.client = APIClient()
        return self.patient, self.doctor

class SessionMixin:
    """Mixin for tests that need session data"""
    
    def setup_session(self, user=None):
        if user is None:
            user = UserFactory()
        self.session = SessionFactory(user_email=user)
        return self.session
        
    def add_chat_to_session(self, session=None, message="Test message", role="user"):
        if session is None:
            session = self.session
        chat_message = {'role': role, 'content': message}
        session.session_chats.append(chat_message)
        session.save()
        return session

class MedicalRecordMixin:
    """Mixin for tests that need medical records"""
    
    def setup_medical_record(self, user=None):
        if user is None:
            user = UserFactory()
        self.medical_record = MedicalRecordFactory(user=user)
        return self.medical_record
    
    def setup_multiple_records(self, user=None, count=3):
        if user is None:
            user = UserFactory()
        records = [MedicalRecordFactory(user=user) for _ in range(count)]
        return records

class DocumentMixin:
    """Mixin for tests that need document data"""
    
    def setup_document(self, user=None):
        if user is None:
            user = UserFactory()
        self.document = DocumentFactory(user=user)
        return self.document
    
    def setup_multiple_documents(self, user=None, count=3):
        if user is None:
            user = UserFactory()
        documents = [DocumentFactory(user=user) for _ in range(count)]
        return documents

class MedicationMixin:
    """Mixin for tests that need medication data"""
    
    def setup_medication(self, user=None):
        if user is None:
            user = UserFactory()
        self.medication = MedicationFactory(user=user)
        return self.medication
    
    def setup_multiple_medications(self, user=None, count=3):
        if user is None:
            user = UserFactory()
        medications = [MedicationFactory(user=user) for _ in range(count)]
        return medications

class AppointmentMixin:
    """Mixin for tests that need appointment data"""
    
    def setup_appointment(self, patient=None, doctor=None):
        if patient is None:
            patient = UserFactory(role='patient')
        if doctor is None:
            doctor = DoctorFactory()
        self.appointment = AppointmentFactory(patient=patient, doctor=doctor)
        return self.appointment
    
    def setup_multiple_appointments(self, patient=None, doctor=None, count=3):
        if patient is None:
            patient = UserFactory(role='patient')
        if doctor is None:
            doctor = DoctorFactory()
        appointments = [AppointmentFactory(patient=patient, doctor=doctor) for _ in range(count)]
        return appointments

class NotificationMixin:
    """Mixin for tests that need notification data"""
    
    def setup_notification(self, user=None):
        if user is None:
            user = UserFactory()
        self.notification = NotificationFactory(user=user)
        return self.notification
    
    def setup_read_notification(self, user=None):
        if user is None:
            user = UserFactory()
        self.read_notification = NotificationFactory(user=user, read=True)
        return self.read_notification
    
    def setup_multiple_notifications(self, user=None, count=3):
        if user is None:
            user = UserFactory()
        notifications = [NotificationFactory(user=user) for _ in range(count)]
        return notifications
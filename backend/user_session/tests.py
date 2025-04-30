from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from datetime import datetime, timedelta, date
from .models import User, Session, MedicalRecord, Document, Medication, Appointment, Notification
import json

class UserViewSetTests(APITestCase):
    def setUp(self):
        # Create test users
        self.doctor = User.objects.create(
            name="Dr. Smith",
            email="doctor@example.com",
            role="doctor"
        )
        
        self.patient = User.objects.create(
            name="John Doe",
            email="patient@example.com",
            role="patient"
        )
        
        self.client = APIClient()
        
    def test_create_user(self):
        """Test creating a new user"""
        url = reverse('user-list')
        data = {
            'name': 'New User',
            'email': 'newuser@example.com',
            'role': 'patient'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 3)
        self.assertEqual(User.objects.get(email='newuser@example.com').name, 'New User')
    
    def test_update_user(self):
        """Test updating an existing user"""
        url = reverse('user-detail', kwargs={'email': self.patient.email})
        data = {
            'name': 'Updated Name'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(email=self.patient.email).name, 'Updated Name')
    
    def test_delete_user(self):
        """Test deleting a user"""
        url = reverse('user-detail', kwargs={'email': self.patient.email})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(User.objects.count(), 1)
        with self.assertRaises(User.DoesNotExist):
            User.objects.get(email=self.patient.email)
    
    def test_fetch_by_email(self):
        """Test fetching user by email endpoint"""
        url = reverse('user-fetch-by-email')
        
        response = self.client.get(url, {'email': self.doctor.email})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.doctor.name)
        self.assertEqual(response.data['email'], self.doctor.email)
    
    def test_fetch_by_email_not_found(self):
        """Test fetching user by email that doesn't exist"""
        url = reverse('user-fetch-by-email')
        
        response = self.client.get(url, {'email': 'nonexistent@example.com'})
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_doctors_list(self):
        """Test getting all doctors list"""
        url = reverse('doctors-list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], self.doctor.email)
        

class SessionViewSetTests(APITestCase):
    def setUp(self):
        # Create test user and session
        self.user = User.objects.create(
            name="Test User",
            email="test@example.com",
            role="patient"
        )
        
        self.session = Session.objects.create(
            user_email=self.user,
            session_chats=[]
        )
        
        self.client = APIClient()
        
    def test_create_session(self):
        """Test creating a new session for an existing user"""
        url = reverse('session-list')
        data = {
            'user_email': self.user.email
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Session.objects.count(), 2)
        
    def test_create_session_new_user(self):
        """Test creating a session for a non-existent user (should create the user)"""
        url = reverse('session-list')
        data = {
            'user_email': 'newuser@example.com'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email='newuser@example.com').exists(), True)
        
    def test_add_chat(self):
        """Test adding a chat message to a session"""
        url = reverse('session-add-chat', kwargs={'pk': self.session.id})
        data = {
            'message': {'role': 'user', 'content': 'Test message'}
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['session_chats']), 1)
        self.assertEqual(response.data['session_chats'][0]['content'], 'Test message')
        
    def test_clear_chats(self):
        """Test clearing all chats from a session"""
        # First add a chat message
        self.session.session_chats = [{'role': 'user', 'content': 'Test message'}]
        self.session.save()
        
        url = reverse('session-clear-chats', kwargs={'pk': self.session.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(Session.objects.get(id=self.session.id).session_chats), 0)
        
    def test_user_sessions(self):
        """Test getting all sessions for a specific user"""
        # Create another session for the same user
        Session.objects.create(
            user_email=self.user,
            session_chats=[]
        )
        
        url = reverse('user-sessions')
        
        response = self.client.get(url, {'email': self.user.email})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        

class RecordsViewTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create(
            name="Test User",
            email="test@example.com",
            role="patient"
        )
        
        self.doctor = User.objects.create(
            name="Dr. Smith",
            email="doctor@example.com",
            role="doctor"
        )
        
        # Create test records
        self.medical_record = MedicalRecord.objects.create(
            user=self.user,
            date=date.today(),
            type="Physical",
            doctor="Dr. Smith",
            findings="Good health",
            recommendations="Exercise regularly"
        )
        
        self.document = Document.objects.create(
            user=self.user,
            title="Blood Test",
            type="Lab Result",
            date=date.today(),
            file="base64encodedstring"
        )
        
        self.medication = Medication.objects.create(
            user=self.user,
            name="Aspirin",
            dosage="100mg",
            frequency="Once daily",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10),
            instructions="Take with food"
        )
        
        self.client = APIClient()
        
    def test_get_records(self):
        """Test getting all records"""
        url = reverse('get_records')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['records']), 1)
        self.assertEqual(len(response.data['documents']), 1)
        self.assertEqual(len(response.data['medications']), 1)
        
    def test_get_user_records(self):
        """Test getting records for a specific user"""
        url = reverse('get_user_records')
        
        response = self.client.get(url, {'email': self.user.email})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['records']), 1)
        self.assertEqual(len(response.data['documents']), 1)
        self.assertEqual(len(response.data['medications']), 1)
        
    def test_add_medication(self):
        """Test adding a new medication"""
        url = reverse('add_medication')
        data = {
            'user': self.user.id,
            'name': 'Ibuprofen',
            'dosage': '200mg',
            'frequency': 'Twice daily',
            'start_date': date.today().isoformat(),
            'instructions': 'Take as needed'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Medication.objects.count(), 2)
        
    def test_add_medical_record(self):
        """Test adding a new medical record"""
        url = reverse('add_medical_record')
        data = {
            'user': self.user.id,
            'date': date.today().isoformat(),
            'type': 'Checkup',
            'doctor': 'Dr. Jones',
            'findings': 'Normal',
            'recommendations': 'None'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MedicalRecord.objects.count(), 2)
        
    def test_add_document(self):
        """Test adding a new document for a specific user"""
        url = reverse('add_document', kwargs={'user_email': self.user.email})
        data = {
            'title': 'X-Ray',
            'type': 'Imaging',
            'date': date.today().isoformat(),
            'file': 'base64encodedimage'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 2)


class AppointmentViewSetTests(APITestCase):
    def setUp(self):
        # Create test users
        self.doctor = User.objects.create(
            name="Dr. Smith",
            email="doctor@example.com",
            role="doctor"
        )
        
        self.patient = User.objects.create(
            name="John Doe",
            email="patient@example.com",
            role="patient"
        )
        
        # Create test appointment
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=date.today() + timedelta(days=5),
            start_time="09:00:00",
            end_time="10:00:00",
            status="pending"
        )
        
        self.client = APIClient()
        
    def test_create_appointment(self):
        """Test creating a new appointment"""
        url = reverse('appointments-list')
        data = {
            'doctor_email': self.doctor.email,
            'appointment_date': (date.today() + timedelta(days=7)).isoformat(),
            'start_time': "14:00:00",
            'end_time': "15:00:00"
        }
        
        response = self.client.post(url + f"?email={self.patient.email}", data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 2)
        
    def test_get_user_appointments(self):
        """Test getting appointments for a specific user"""
        url = reverse('user-appointments', kwargs={'email': self.patient.email})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_add_medical_record_to_appointment(self):
        """Test adding a medical record to an appointment"""
        url = reverse('appointment-add-medical-record', kwargs={'pk': self.appointment.id})
        data = {
            'date': date.today().isoformat(),
            'type': 'Follow-up',
            'doctor': self.doctor.name,
            'findings': 'Patient improving',
            'recommendations': 'Continue treatment'
        }
        
        response = self.client.post(url + f"?email={self.doctor.email}", data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MedicalRecord.objects.count(), 1)
        self.assertEqual(MedicalRecord.objects.first().user, self.patient)
        
    def test_add_medication_to_appointment(self):
        """Test adding a medication through an appointment"""
        url = reverse('appointment-add-medication', kwargs={'pk': self.appointment.id})
        data = {
            'name': 'Prescription Med',
            'dosage': '50mg',
            'frequency': 'Three times daily',
            'start_date': date.today().isoformat(),
            'end_date': (date.today() + timedelta(days=14)).isoformat(),
            'instructions': 'Take after meals'
        }
        
        response = self.client.post(url + f"?email={self.doctor.email}", data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Medication.objects.count(), 1)
        self.assertEqual(Medication.objects.first().user, self.patient)


class DocumentUploadTests(APITestCase):
    def setUp(self):
        # Create test users
        self.doctor = User.objects.create(
            name="Dr. Smith",
            email="doctor@example.com",
            role="doctor"
        )
        
        self.patient = User.objects.create(
            name="John Doe",
            email="patient@example.com",
            role="patient"
        )
        
        self.client = APIClient()
        
    def test_patient_upload_document(self):
        """Test patient uploading their own document"""
        url = reverse('patient-upload-document')
        data = {
            'title': 'Personal Document',
            'type': 'Insurance',
            'date': date.today().isoformat(),
            'file': 'base64encodeddata'
        }
        
        response = self.client.post(url + f"?email={self.patient.email}", data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 1)
        self.assertEqual(Document.objects.first().user, self.patient)
        
    def test_doctor_upload_document(self):
        """Test doctor uploading document for a patient"""
        url = reverse('doctor-upload-document')
        data = {
            'title': 'Medical Report',
            'type': 'Diagnosis',
            'date': date.today().isoformat(),
            'file': 'base64encodedreport'
        }
        
        query_params = f"?doctor_email={self.doctor.email}&patient_email={self.patient.email}"
        response = self.client.post(url + query_params, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 1)
        self.assertEqual(Document.objects.first().user, self.patient)
        
    def test_patient_upload_document_missing_email(self):
        """Test patient uploading document without providing email"""
        url = reverse('patient-upload-document')
        data = {
            'title': 'Personal Document',
            'type': 'Insurance',
            'date': date.today().isoformat(),
            'file': 'base64encodeddata'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Document.objects.count(), 0)


class MedicalRecordViewSetTests(APITestCase):
    def setUp(self):
        # Create test users
        self.doctor = User.objects.create(
            name="Dr. Smith",
            email="doctor@example.com",
            role="doctor"
        )
        
        self.patient = User.objects.create(
            name="John Doe",
            email="patient@example.com",
            role="patient"
        )
        
        # Create test medical record
        self.medical_record = MedicalRecord.objects.create(
            user=self.patient,
            date=date.today(),
            type="Annual Checkup",
            doctor="Dr. Smith",
            findings="Normal",
            recommendations="Continue regular checkups"
        )
        
        self.client = APIClient()
        
    def test_get_medical_records(self):
        """Test getting medical records for a specific user"""
        url = reverse('medical-record-list')
        
        response = self.client.get(url + f"?email={self.patient.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'Annual Checkup')
        
    def test_create_medical_record(self):
        """Test creating a new medical record"""
        url = reverse('medical-record-list')
        data = {
            'user': self.patient.id,
            'date': date.today().isoformat(),
            'type': 'Specialist Consultation',
            'doctor': 'Dr. Johnson',
            'findings': 'Requires further tests',
            'recommendations': 'Follow up in 2 weeks'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MedicalRecord.objects.count(), 2)


class DocumentViewSetTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create(
            name="Test User",
            email="test@example.com",
            role="patient"
        )
        
        # Create test document
        self.document = Document.objects.create(
            user=self.user,
            title="Lab Report",
            type="Blood Test",
            date=date.today(),
            file="base64encodeddata"
        )
        
        self.client = APIClient()
        
    def test_get_documents(self):
        """Test getting documents for a specific user"""
        url = reverse('document-list')
        
        response = self.client.get(url + f"?email={self.user.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Lab Report')
        
    def test_create_document(self):
        """Test creating a new document"""
        url = reverse('document-list')
        data = {
            'user': self.user.id,
            'title': 'X-Ray Report',
            'type': 'Imaging',
            'date': date.today().isoformat(),
            'file': 'base64encodedxray'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 2)


class MedicationViewSetTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create(
            name="Test User",
            email="test@example.com",
            role="patient"
        )
        
        # Create test medication
        self.medication = Medication.objects.create(
            user=self.user,
            name="Test Med",
            dosage="10mg",
            frequency="Daily",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            instructions="Take with water"
        )
        
        self.client = APIClient()
        
    def test_get_medications(self):
        """Test getting medications for a specific user"""
        url = reverse('medication-list')
        
        response = self.client.get(url + f"?email={self.user.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Med')
        
    def test_create_medication(self):
        """Test creating a new medication"""
        url = reverse('medication-list')
        data = {
            'user': self.user.id,
            'name': 'New Med',
            'dosage': '5mg',
            'frequency': 'Twice daily',
            'start_date': date.today().isoformat(),
            'end_date': (date.today() + timedelta(days=14)).isoformat(),
            'instructions': 'Take after meals'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Medication.objects.count(), 2)


class NotificationViewSetTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create(
            name="Test User",
            email="test@example.com",
            role="patient"
        )
        
        # Create test notifications
        self.notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test notification",
            type="reminder"
        )
        
        self.read_notification = Notification.objects.create(
            user=self.user,
            title="Read Notification",
            message="This notification has been read",
            type="reminder",
            read=True
        )
        
        self.client = APIClient()
        
    def test_get_notifications(self):
        """Test getting all notifications for a user"""
        url = reverse('notification-list')
        
        response = self.client.get(url + f"?user_email={self.user.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
    def test_create_notification(self):
        """Test creating a new notification"""
        url = reverse('create-notification')
        data = {
            'user_email': self.user.email,
            'title': 'New Notification',
            'message': 'This is a new notification',
            'type': 'reminder'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.count(), 3)
        
    def test_get_unread_notifications(self):
        """Test getting only unread notifications"""
        url = reverse('unread-notifications')
        
        response = self.client.get(url + f"?user_email={self.user.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Notification')

    def test_mark_all_read(self):
        """Test marking all notifications as read"""
        url = reverse('mark-all-notifications-read')
        
        response = self.client.patch(url + f"?user_email={self.user.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unread_count = Notification.objects.filter(user=self.user, read=False).count()
        self.assertEqual(unread_count, 0)
        
    def test_generate_medication_reminders(self):
        """Test generating medication reminders"""
        # Create active medication
        medication = Medication.objects.create(
            user=self.user,
            name="Daily Med",
            dosage="20mg",
            frequency="Once daily",
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=5),
            instructions="Take in the morning"
        )
        
        url = reverse('generate-medication-reminders')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if a reminder was created for our medication
        reminder_exists = Notification.objects.filter(
            user=self.user,
            type="reminder",
            medication=medication
        ).exists()
        self.assertTrue(reminder_exists)
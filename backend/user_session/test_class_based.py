from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import datetime, timedelta
from .models import User, Session, MedicalRecord, Document, Medication, Appointment, Notification
from .test_mixins import (
    UserMixin, SessionMixin, MedicalRecordMixin, DocumentMixin,
    MedicationMixin, AppointmentMixin, NotificationMixin
)

class UserViewSetTestsWithMixin(APITestCase, UserMixin):
    def setUp(self):
        self.patient, self.doctor = self.setup_users()
        
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
        print(f"Checking if user exists: {User.objects.filter(email='newuser@example.com').exists()}")
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())
        self.assertEqual(User.objects.get(email='newuser@example.com').name, 'New User')
    
    def test_update_user(self):
        """Test updating an existing user"""
        url = f'/api/user/users/{self.patient.email}/'
        data = {
            'name': 'Updated Name'
        }

        print(f"Checking if user exists: {User.objects.filter(email=self.patient.email).exists()}")
        response = self.client.patch(url, data, format='json')
        print(response.content)  # Debug output

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(email=self.patient.email).name, 'Updated Name')

    
    def test_doctors_list(self):
        """Test getting all doctors list"""
        url = reverse('doctors-list')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], self.doctor.email)


class SessionViewSetTestsWithMixin(APITestCase, UserMixin, SessionMixin):
    def setUp(self):
        self.patient, self.doctor = self.setup_users()
        self.session = self.setup_session(user=self.patient)
        
    def test_create_session(self):
        """Test creating a new session for an existing user"""
        url = reverse('session-list')
        data = {
            'user_email': self.patient.email
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Session.objects.filter(user_email=self.patient).count(), 2)
        
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
        
    def test_user_sessions(self):
        """Test getting all sessions for a specific user"""
        # Create another session for the same user
        self.setup_session(user=self.patient)
        
        url = reverse('user-sessions')
        
        response = self.client.get(url, {'email': self.patient.email})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class MedicalRecordViewSetTestsWithMixin(APITestCase, UserMixin, MedicalRecordMixin):
    def setUp(self):
        self.patient, self.doctor = self.setup_users()
        self.medical_record = self.setup_medical_record(user=self.patient)
        
    def test_get_medical_records(self):
        """Test getting medical records for a specific user"""
        url = reverse('medical-record-list')
        
        response = self.client.get(url + f"?email={self.patient.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_create_medical_record(self):
        """Test creating a new medical record"""
        url = reverse('medical-record-list')
        data = {
            'user': self.patient.id,
            'date': datetime.now().date().isoformat(),
            'type': 'Specialist Consultation',
            'doctor': 'Dr. Johnson',
            'findings': 'Requires further tests',
            'recommendations': 'Follow up in 2 weeks'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MedicalRecord.objects.filter(user=self.patient).count(), 2)


class RecordsViewTestsWithMixin(APITestCase, UserMixin, MedicalRecordMixin, DocumentMixin, MedicationMixin):
    def setUp(self):
        self.patient, self.doctor = self.setup_users()
        self.medical_record = self.setup_medical_record(user=self.patient)
        self.document = self.setup_document(user=self.patient)
        self.medication = self.setup_medication(user=self.patient)
        
    def test_get_user_records(self):
        """Test getting records for a specific user"""
        url = reverse('get_user_records')
        
        response = self.client.get(url, {'email': self.patient.email})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['records']), 1)
        self.assertEqual(len(response.data['documents']), 1)
        self.assertEqual(len(response.data['medications']), 1)
        
    def test_add_medication(self):
        """Test adding a new medication"""
        url = reverse('add_medication')
        data = {
            'user': self.patient.id,
            'name': 'Ibuprofen',
            'dosage': '200mg',
            'frequency': 'Twice daily',
            'start_date': datetime.now().date().isoformat(),
            'instructions': 'Take as needed'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Medication.objects.filter(user=self.patient).count(), 2)


class AppointmentViewSetTestsWithMixin(APITestCase, UserMixin, AppointmentMixin):
    def setUp(self):
        self.patient, self.doctor = self.setup_users()
        self.appointment = self.setup_appointment(patient=self.patient, doctor=self.doctor)
        
    def test_get_user_appointments(self):
        """Test getting appointments for a specific user"""
        url = reverse('user-appointments', kwargs={'email': self.patient.email})
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_create_appointment(self):
        """Test creating a new appointment"""
        url = reverse('appointments-list')
        data = {
            'doctor_email': self.doctor.email,
            'appointment_date': (datetime.now().date() + timedelta(days=7)).isoformat(),
            'start_time': "14:00:00",
            'end_time': "15:00:00"
        }
        
        response = self.client.post(url + f"?email={self.patient.email}", data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.filter(patient=self.patient).count(), 2)


class NotificationViewSetTestsWithMixin(APITestCase, UserMixin, NotificationMixin):
    def setUp(self):
        self.patient, self.doctor = self.setup_users()
        self.notification = self.setup_notification(user=self.patient)
        self.read_notification = self.setup_read_notification(user=self.patient)
        
    def test_get_notifications(self):
        """Test getting all notifications for a user"""
        url = reverse('notification-list')
        
        response = self.client.get(url + f"?user_email={self.patient.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
    def test_get_unread_notifications(self):
        """Test getting only unread notifications"""
        url = reverse('unread-notifications')
        
        response = self.client.get(url + f"?user_email={self.patient.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], self.notification.title)

    def test_mark_all_read(self):
        """Test marking all notifications as read"""
        url='/api/user/notifications/mark_all_read/'
        
        response = self.client.patch(url + f"?user_email={self.patient.email}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unread_count = Notification.objects.filter(user=self.patient, read=False).count()
        self.assertEqual(unread_count, 0)
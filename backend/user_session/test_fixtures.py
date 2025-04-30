import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from datetime import timedelta
from django.utils import timezone

class TestUserEndpoints:
    def test_create_user(self, api_client):
        """Test creating a new user"""
        url = reverse('user-list')
        data = {
            'name': 'New User',
            'email': 'newuser@example.com',
            'role': 'patient'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['email'] == 'newuser@example.com'
        assert response.data['name'] == 'New User'
    
    def test_get_user(self, api_client, patient):
        """Test getting a user by email"""
        url = reverse('user-detail', kwargs={'email': patient.email})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == patient.email
        assert response.data['name'] == patient.name

    def test_delete_user(self, api_client, patient):
        """Test deleting a user"""
        url = reverse('user-detail', kwargs={'email': patient.email})
        
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT


class TestSessionEndpoints:
    def test_create_session(self, api_client, patient):
        """Test creating a new session"""
        url = reverse('session-list')
        data = {
            'user_email': patient.email
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user_email'] == patient.email
    
    def test_add_chat_to_session(self, api_client, session):
        """Test adding a chat message to a session"""
        url = reverse('session-add-chat', kwargs={'pk': session.id})
        data = {
            'message': {'role': 'user', 'content': 'Test message'}
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['session_chats']) == 1
        assert response.data['session_chats'][0]['content'] == 'Test message'
    
    def test_clear_session_chats(self, api_client, session_with_chats):
        """Test clearing all chats from a session"""
        url = reverse('session-clear-chats', kwargs={'pk': session_with_chats.id})
        
        response = api_client.delete(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['session_chats']) == 0


class TestMedicalRecordEndpoints:
    def test_get_medical_records(self, api_client, patient, medical_record):
        """Test getting medical records for a patient"""
        url = reverse('medical-record-list')
        
        response = api_client.get(url + f"?email={patient.email}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == medical_record.id
    
    def test_create_medical_record(self, api_client, patient):
        """Test creating a new medical record"""
        url = reverse('medical-record-list')
        data = {
            'user': patient.id,
            'date': timezone.now().date().isoformat(),
            'type': 'Test Type',
            'doctor': 'Test Doctor',
            'findings': 'Test Findings',
            'recommendations': 'Test Recommendations'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user'] == patient.id
        assert response.data['type'] == 'Test Type'


class TestDocumentEndpoints:
    def test_get_documents(self, api_client, patient, document):
        """Test getting documents for a patient"""
        url = reverse('document-list')
        
        response = api_client.get(url + f"?email={patient.email}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == document.id
    
    def test_create_document(self, api_client, patient):
        """Test creating a new document"""
        url = reverse('document-list')
        data = {
            'user': patient.id,
            'title': 'Test Document',
            'type': 'Test Type',
            'date': timezone.now().date().isoformat(),
            'file': 'test_file_content'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user'] == patient.id
        assert response.data['title'] == 'Test Document'


class TestMedicationEndpoints:
    def test_get_medications(self, api_client, patient, medication):
        """Test getting medications for a patient"""
        url = reverse('medication-list')
        
        response = api_client.get(url + f"?email={patient.email}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == medication.id
    
    def test_create_medication(self, api_client, patient):
        """Test creating a new medication"""
        url = reverse('medication-list')
        data = {
            'user': patient.id,
            'name': 'Test Medication',
            'dosage': '100mg',
            'frequency': 'Daily',
            'start_date': timezone.now().date().isoformat(),
            'end_date': (timezone.now().date() + timedelta(days=30)).isoformat(),
            'instructions': 'Test Instructions'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['user'] == patient.id
        assert response.data['name'] == 'Test Medication'


class TestAppointmentEndpoints:
    def test_get_appointments(self, api_client, patient, doctor, appointment):
        """Test getting appointments for a patient"""
        url = reverse('user-appointments', kwargs={'email': patient.email})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == appointment.id
    
    def test_create_appointment(self, api_client, patient, doctor):
        """Test creating a new appointment"""
        url = reverse('appointments-list')
        data = {
            'doctor_email': doctor.email,
            'appointment_date': (timezone.now().date() + timedelta(days=7)).isoformat(),
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'notes': 'Test Notes'
        }
        
        response = api_client.post(url + f"?email={patient.email}", data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['patient'] == patient.id
        assert response.data['doctor'] == doctor.id


class TestNotificationEndpoints:
    def test_get_notifications(self, api_client, patient, notification, read_notification):
        """Test getting all notifications for a patient"""
        url = reverse('notification-list')
        
        response = api_client.get(url + f"?user_email={patient.email}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
    
    def test_get_unread_notifications(self, api_client, patient, notification, read_notification):
        """Test getting only unread notifications"""
        url = reverse('unread-notifications')
        
        response = api_client.get(url + f"?user_email={patient.email}")
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['id'] == notification.id
    
    def test_mark_notification_as_read(self, api_client, patient, notification):
        """Test marking a notification as read"""
        url = reverse('notification-detail', kwargs={'pk': notification.id})
        data = {'read': True}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['read'] is True
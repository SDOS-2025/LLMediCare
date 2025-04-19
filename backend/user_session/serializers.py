from rest_framework import serializers
from .models import User, Session
from .models import MedicalRecord, Document, Medication, Appointment, Notification
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email', 'role', 'medical_records', 'profile_pic'] 

class SessionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(write_only=True)  # Accept email instead of ID
    class Meta:
        model = Session
        fields = ['id', 'user_email', 'session_chats', 'created_at', 'updated_at']
class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_email = serializers.CharField(write_only=True)
    doctor = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'
        extra_kwargs = {
            'doctor': {'read_only': True},
            'patient': {'read_only': True},  # So the patient field is set from the view.
        }

    def get_doctor(self, obj):
        if obj.doctor:
            return {
                'id': obj.doctor.id,
                'name': obj.doctor.name,
                'email': obj.doctor.email
            }
        return None

    def get_patient(self, obj):
        if obj.patient:
            return {
                'id': obj.patient.id,
                'name': obj.patient.name,
                'email': obj.patient.email
            }
        return None

    def create(self, validated_data):
        doctor_email = validated_data.pop('doctor_email')
        from django.shortcuts import get_object_or_404
        doctor = get_object_or_404(User, email=doctor_email, role='doctor')
        appointment = Appointment.objects.create(doctor=doctor, **validated_data)
        return appointment
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at']
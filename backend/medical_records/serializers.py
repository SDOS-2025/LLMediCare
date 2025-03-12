from rest_framework import serializers
from .models import MedicalRecord, MedicalDocument, Medication, MedicationReminder
from users.serializers import UserSerializer

class MedicalDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for medical documents
    """
    class Meta:
        model = MedicalDocument
        fields = ('id', 'medical_record', 'file', 'file_name', 'file_type', 'uploaded_at')
        read_only_fields = ('uploaded_at',)

class MedicalRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for medical records
    """
    documents = MedicalDocumentSerializer(many=True, read_only=True)
    patient_details = serializers.SerializerMethodField()
    healthcare_professional_details = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalRecord
        fields = ('id', 'patient', 'patient_details', 'record_type', 'title', 
                  'description', 'date_recorded', 'healthcare_professional', 
                  'healthcare_professional_details', 'documents', 'created_at', 
                  'updated_at', 'is_active')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        return UserSerializer(obj.patient).data
    
    def get_healthcare_professional_details(self, obj):
        if obj.healthcare_professional:
            return UserSerializer(obj.healthcare_professional).data
        return None

class MedicalRecordCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating medical records
    """
    documents = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = MedicalRecord
        fields = ('patient', 'record_type', 'title', 'description', 
                  'date_recorded', 'healthcare_professional', 'documents')
    
    def validate(self, data):
        user = self.context['request'].user
        
        # If user is a patient, they can only create records for themselves
        if user.user_type == 'patient' and data.get('patient') != user:
            raise serializers.ValidationError("Patients can only create records for themselves")
        
        # If healthcare_professional is provided, ensure it's a valid healthcare professional
        if 'healthcare_professional' in data and data['healthcare_professional']:
            if data['healthcare_professional'].user_type != 'healthcare_professional':
                raise serializers.ValidationError("Selected user is not a healthcare professional")
        
        return data
    
    def create(self, validated_data):
        documents_data = validated_data.pop('documents', [])
        
        # If user is a healthcare professional and creating a record, set themselves as the professional
        user = self.context['request'].user
        if user.user_type == 'healthcare_professional' and not validated_data.get('healthcare_professional'):
            validated_data['healthcare_professional'] = user
        
        medical_record = MedicalRecord.objects.create(**validated_data)
        
        # Create medical documents
        for document in documents_data:
            MedicalDocument.objects.create(
                medical_record=medical_record,
                file=document,
                file_name=document.name,
                file_type=document.content_type
            )
        
        return medical_record

class MedicationReminderSerializer(serializers.ModelSerializer):
    """
    Serializer for medication reminders
    """
    class Meta:
        model = MedicationReminder
        fields = ('id', 'medication', 'reminder_time', 'is_sent', 'last_sent')
        read_only_fields = ('is_sent', 'last_sent')

class MedicationSerializer(serializers.ModelSerializer):
    """
    Serializer for medications
    """
    reminders = MedicationReminderSerializer(many=True, read_only=True)
    patient_details = serializers.SerializerMethodField()
    prescribed_by_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Medication
        fields = ('id', 'patient', 'patient_details', 'name', 'dosage', 
                  'frequency', 'time_of_day', 'start_date', 'duration', 
                  'duration_unit', 'end_date', 'instructions', 'is_active', 
                  'prescribed_by', 'prescribed_by_details', 'reminders', 
                  'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        return UserSerializer(obj.patient).data
    
    def get_prescribed_by_details(self, obj):
        if obj.prescribed_by:
            return UserSerializer(obj.prescribed_by).data
        return None

class MedicationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating medications
    """
    reminders = serializers.ListField(
        child=serializers.TimeField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Medication
        fields = ('patient', 'name', 'dosage', 'frequency', 'time_of_day', 
                  'start_date', 'duration', 'duration_unit', 'end_date', 
                  'instructions', 'prescribed_by', 'reminders')
    
    def validate(self, data):
        user = self.context['request'].user
        
        # If user is a patient, they can only create medications for themselves
        if user.user_type == 'patient' and data.get('patient') != user:
            raise serializers.ValidationError("Patients can only create medications for themselves")
        
        # If prescribed_by is provided, ensure it's a valid healthcare professional
        if 'prescribed_by' in data and data['prescribed_by']:
            if data['prescribed_by'].user_type != 'healthcare_professional':
                raise serializers.ValidationError("Selected user is not a healthcare professional")
        
        # Calculate end_date if duration and duration_unit are provided but end_date is not
        if not data.get('end_date') and data.get('duration') and data.get('duration_unit'):
            start_date = data.get('start_date')
            duration = data.get('duration')
            duration_unit = data.get('duration_unit')
            
            if duration_unit == 'days':
                data['end_date'] = start_date + timedelta(days=duration)
            elif duration_unit == 'weeks':
                data['end_date'] = start_date + timedelta(weeks=duration)
            elif duration_unit == 'months':
                # Approximate months as 30 days
                data['end_date'] = start_date + timedelta(days=duration*30)
        
        return data
    
    def create(self, validated_data):
        reminders_data = validated_data.pop('reminders', [])
        
        # If user is a healthcare professional and creating a medication, set themselves as prescribed_by
        user = self.context['request'].user
        if user.user_type == 'healthcare_professional' and not validated_data.get('prescribed_by'):
            validated_data['prescribed_by'] = user
        
        medication = Medication.objects.create(**validated_data)
        
        # Create medication reminders
        for reminder_time in reminders_data:
            MedicationReminder.objects.create(
                medication=medication,
                reminder_time=reminder_time
            )
        
        return medication

from rest_framework import serializers
from .models import Appointment, AvailabilitySlot, Reminder
from users.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for appointments"""
    patient_details = serializers.SerializerMethodField()
    healthcare_professional_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ('id', 'patient', 'healthcare_professional', 'patient_details', 
                  'healthcare_professional_details', 'date', 'start_time', 'end_time', 
                  'reason', 'status', 'appointment_type', 'meeting_link', 'notes', 
                  'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        return UserSerializer(obj.patient).data
    
    def get_healthcare_professional_details(self, obj):
        return UserSerializer(obj.healthcare_professional).data

class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments"""
    
    class Meta:
        model = Appointment
        fields = ('healthcare_professional', 'date', 'start_time', 'end_time', 
                  'reason', 'appointment_type')
    
    def validate(self, data):
        # Check if healthcare professional is actually a healthcare professional
        if data['healthcare_professional'].user_type != 'healthcare_professional':
            raise serializers.ValidationError("Selected user is not a healthcare professional")
            
        # Check if healthcare professional has verified license
        if not hasattr(data['healthcare_professional'], 'healthcare_profile') or \
           not data['healthcare_professional'].healthcare_profile.is_license_verified:
            raise serializers.ValidationError("Healthcare professional's license is not verified")
        
        # Check if healthcare professional is available at the requested time
        day_of_week = data['date'].weekday()
        start_time = data['start_time']
        end_time = data['end_time']
        
        # Check if there's an availability slot that matches
        slots = AvailabilitySlot.objects.filter(
            healthcare_professional=data['healthcare_professional'],
            day_of_week=day_of_week,
            start_time__lte=start_time,
            end_time__gte=end_time,
            is_available=True
        )
        
        if not slots.exists():
            raise serializers.ValidationError("Healthcare professional is not available at the requested time")
        
        # Check for overlapping appointments
        overlapping_appointments = Appointment.objects.filter(
            healthcare_professional=data['healthcare_professional'],
            date=data['date'],
            status__in=['pending', 'confirmed'],
        ).filter(
            (models.Q(start_time__lt=end_time) & models.Q(end_time__gt=start_time))
        )
        
        if overlapping_appointments.exists():
            raise serializers.ValidationError("The healthcare professional already has an appointment at this time")
        
        return data
    
    def create(self, validated_data):
        # Set the patient as the current user
        validated_data['patient'] = self.context['request'].user
        appointment = Appointment.objects.create(**validated_data)
        
        # Create a reminder for the appointment (24 hours before)
        reminder_time = datetime.combine(appointment.date, appointment.start_time) - timedelta(hours=24)
        Reminder.objects.create(appointment=appointment, reminder_time=reminder_time)
        
        return appointment

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointments"""
    
    class Meta:
        model = Appointment
        fields = ('date', 'start_time', 'end_time', 'reason', 'status', 
                  'appointment_type', 'meeting_link', 'notes')
    
    def validate(self, data):
        if 'date' in data and 'start_time' in data and 'end_time' in data:
            # If rescheduling, check availability again
            day_of_week = data['date'].weekday()
            start_time = data['start_time']
            end_time = data['end_time']
            
            # Check if there's an availability slot that matches
            slots = AvailabilitySlot.objects.filter(
                healthcare_professional=self.instance.healthcare_professional,
                day_of_week=day_of_week,
                start_time__lte=start_time,
                end_time__gte=end_time,
                is_available=True
            )
            
            if not slots.exists():
                raise serializers.ValidationError("Healthcare professional is not available at the requested time")
            
            # Check for overlapping appointments (excluding this appointment)
            overlapping_appointments = Appointment.objects.filter(
                healthcare_professional=self.instance.healthcare_professional,
                date=data['date'],
                status__in=['pending', 'confirmed'],
            ).exclude(
                id=self.instance.id
            ).filter(
                (models.Q(start_time__lt=end_time) & models.Q(end_time__gt=start_time))
            )
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError("The healthcare professional already has an appointment at this time")
        
        return data
    
    def update(self, instance, validated_data):
        # If status is changed to 'rescheduled', update reminder
        if 'status' in validated_data and validated_data['status'] == 'rescheduled':
            # Update the reminder time based on new appointment time
            date = validated_data.get('date', instance.date)
            start_time = validated_data.get('start_time', instance.start_time)
            reminder_time = datetime.combine(date, start_time) - timedelta(hours=24)
            
            for reminder in instance.reminders.all():
                reminder.reminder_time = reminder_time
                reminder.is_sent = False
                reminder.sent_at = None
                reminder.save()
        
        return super().update(instance, validated_data)

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    """Serializer for availability slots"""
    
    class Meta:
        model = AvailabilitySlot
        fields = ('id', 'healthcare_professional', 'day_of_week', 'start_time', 
                  'end_time', 'is_available')
    
    def validate(self, data):
        # Ensure end_time is after start_time
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time")
        
        # Check for overlapping availability slots
        overlapping_slots = AvailabilitySlot.objects.filter(
            healthcare_professional=data['healthcare_professional'],
            day_of_week=data['day_of_week'],
            is_available=True
        ).filter(
            (models.Q(start_time__lt=data['end_time']) & models.Q(end_time__gt=data['start_time']))
        )
        
        # If updating, exclude current instance
        if self.instance:
            overlapping_slots = overlapping_slots.exclude(id=self.instance.id)
            
        if overlapping_slots.exists():
            raise serializers.ValidationError("This slot overlaps with an existing availability slot")
        
        return data

class ReminderSerializer(serializers.ModelSerializer):
    """Serializer for appointment reminders"""
    
    class Meta:
        model = Reminder
        fields = ('id', 'appointment', 'reminder_time', 'is_sent', 'sent_at')

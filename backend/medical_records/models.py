from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class MedicalRecord(models.Model):
    """
    Model for storing patient medical records
    """
    RECORD_TYPES = (
        ('general', 'General Health Record'),
        ('diagnosis', 'Diagnosis'),
        ('prescription', 'Prescription'),
        ('test_result', 'Test Result'),
        ('vaccination', 'Vaccination'),
        ('surgery', 'Surgery'),
        ('allergy', 'Allergy'),
        ('other', 'Other'),
    )
    
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medical_records',
        limit_choices_to={'user_type': 'patient'}
    )
    record_type = models.CharField(max_length=20, choices=RECORD_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_recorded = models.DateField()
    healthcare_professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_records',
        limit_choices_to={'user_type': 'healthcare_professional'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-date_recorded']
        
    def __str__(self):
        return f"{self.title} - {self.patient.get_full_name()}"

class MedicalDocument(models.Model):
    """
    Model for storing medical documents (e.g., test reports, prescriptions, etc.)
    """
    medical_record = models.ForeignKey(
        MedicalRecord,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    file = models.FileField(upload_to='medical_documents/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        
    def __str__(self):
        return self.file_name

class Medication(models.Model):
    """
    Model for storing medication details
    """
    FREQUENCY_CHOICES = (
        ('once', 'Once a day'),
        ('twice', 'Twice a day'),
        ('thrice', 'Thrice a day'),
        ('four', 'Four times a day'),
        ('as_needed', 'As needed'),
        ('other', 'Other'),
    )
    
    DURATION_UNIT_CHOICES = (
        ('days', 'Days'),
        ('weeks', 'Weeks'),
        ('months', 'Months'),
        ('continuous', 'Continuous'),
    )
    
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medications',
        limit_choices_to={'user_type': 'patient'}
    )
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    time_of_day = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField()
    duration = models.PositiveIntegerField(null=True, blank=True)
    duration_unit = models.CharField(max_length=20, choices=DURATION_UNIT_CHOICES, null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    instructions = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    prescribed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prescribed_medications',
        limit_choices_to={'user_type': 'healthcare_professional'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date', 'name']
        
    def __str__(self):
        return f"{self.name} - {self.patient.get_full_name()}"

class MedicationReminder(models.Model):
    """
    Model for medication reminders
    """
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name='reminders'
    )
    reminder_time = models.TimeField()
    is_sent = models.BooleanField(default=False)
    last_sent = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['reminder_time']
        
    def __str__(self):
        return f"Reminder for {self.medication.name} at {self.reminder_time}"

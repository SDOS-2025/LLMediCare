from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
ROLE_CHOICES = [
    ('doctor', 'Doctor'),
    ('patient', 'Patient'),
]

class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    # You might want to remove or repurpose this field if you're using relational models for records.
    medical_records = models.JSONField(default=list, null=True, blank=True)
    profile_pic = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Session(models.Model):
    user_email = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_chats = models.JSONField(default=list, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Session {self.id} for {self.user_email.name}'

# New models for handling records, documents, and medications

class MedicalRecord(models.Model):
    # Optional: associate a medical record with a user
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='records', null=True, blank=True)
    date = models.DateField()
    type = models.CharField(max_length=50)
    doctor = models.CharField(max_length=255)
    findings = models.TextField()
    recommendations = models.TextField()

    def __str__(self):
        return f"{self.type} on {self.date}"
    
    # Add to MedicalRecord model
    def save(self, *args, **kwargs):
        is_new = not self.pk  # Check if this is a new record
        super().save(*args, **kwargs)
        
        # If this is a new record and associated with a user, notify them
        if is_new and self.user:
            Notification.objects.create(
                user=self.user,
                title="New Medical Record Added",
                message=f"Dr. {self.doctor} has added a new {self.type} record to your profile.",
                type="medical_record",
                medical_record=self
            )

class Document(models.Model):
    # Optional: associate a document with a user
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    date = models.DateField()
    file = models.TextField()

    def __str__(self):
        return self.title

class Medication(models.Model):
    # Optional: associate a medication with a user
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medications', null=True, blank=True)
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    instructions = models.TextField()

    def __str__(self):
        return self.name
    
    # Add to Medication model
    def save(self, *args, **kwargs):
        is_new = not self.pk  # Check if this is a new medication
        super().save(*args, **kwargs)
        
        # If this is a new medication and associated with a user, notify them
        if is_new and self.user:
            Notification.objects.create(
                user=self.user,
                title="New Medication Added",
                message=f"A new medication '{self.name}' has been added to your profile.",
                type="medication",
                medication=self
            )

class Appointment(models.Model):
    patient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="patient_appointments"
    )
    doctor = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="doctor_appointments"
    )
    # Changed appointment_date to DateField to select via a calendar widget; 
    # if you need the time as well, use a DateTimeField and adjust accordingly.
    appointment_date = models.DateField()
    # Start and end times for the appointment
    start_time = models.TimeField()
    end_time = models.TimeField()
    notes = models.TextField(null=True, blank=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('refused', 'Refused'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Appointment on {self.appointment_date} between {self.patient.email} and {self.doctor.email}"

    def is_conflicting(self):
        """
        Returns True if there is any accepted appointment for the same doctor 
        on the same appointment_date that overlaps with this appointment's 
        time slot.
        (e.g., 8:00–9:00 conflicts with 8:30–9:30)
        """
        return Appointment.objects.filter(
            doctor=self.doctor,
            appointment_date=self.appointment_date,
            status='accepted',
        ).exclude(pk=self.pk).filter(
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        ).exists()
    
    # Add this to the Appointment model
    def send_notification_on_approval(self):
        """Create notification when appointment is approved by doctor"""
        if self.status == 'accepted':
            Notification.objects.create(
                user=self.patient,
                title="Appointment Approved",
                message=f"Your appointment with Dr. {self.doctor.name} on {self.appointment_date} has been approved.",
                type="appointment",
                appointment=self
            )

    # You can call this method in the save method:
    def save(self, *args, **kwargs):
        # If this is an existing appointment being updated
        if self.pk:
            old_instance = Appointment.objects.get(pk=self.pk)
            # If status changed from pending to accepted
            if old_instance.status != 'accepted' and self.status == 'accepted':
                super().save(*args, **kwargs)  # Save first to ensure the appointment exists
                self.send_notification_on_approval()
            else:
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)
            # Create notification for doctor on new appointment request
            Notification.objects.create(
                user=self.doctor,
                title="New Appointment Request",
                message=f"Patient {self.patient.name} has requested an appointment on {self.appointment_date}.",
                type="appointment",
                appointment=self
            )
    
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    # Type choices for categorizing notifications
    TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('medical_record', 'Medical Record'),
        ('medication', 'Medication'),
        ('reminder', 'Medication Reminder'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Optional reference to related models
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.SET_NULL, null=True, blank=True)
    medication = models.ForeignKey(Medication, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.name}"
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Appointment(models.Model):
    """
    Model to store appointment information between patients and healthcare professionals
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    )
    
    TYPE_CHOICES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
    )
    
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='patient_appointments'
    )
    healthcare_professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='professional_appointments'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    appointment_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='offline')
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-start_time']
        
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.healthcare_professional.get_full_name()} - {self.date}"

class AvailabilitySlot(models.Model):
    """
    Model to store availability slots for healthcare professionals
    """
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    
    healthcare_professional = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='availability_slots'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['day_of_week', 'start_time']
        
    def __str__(self):
        return f"{self.healthcare_professional.get_full_name()} - {self.get_day_of_week_display()} - {self.start_time} to {self.end_time}"

class Reminder(models.Model):
    """
    Model to store appointment reminders
    """
    appointment = models.ForeignKey(
        Appointment, 
        on_delete=models.CASCADE, 
        related_name='reminders'
    )
    reminder_time = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['reminder_time']
        
    def __str__(self):
        return f"Reminder for {self.appointment} at {self.reminder_time}"

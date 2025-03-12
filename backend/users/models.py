from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom user model to handle both patients and healthcare professionals
    """
    USER_TYPE_CHOICES = (
        ('patient', 'Patient'),
        ('healthcare_professional', 'Healthcare Professional'),
    )
    
    user_type = models.CharField(_('User Type'), max_length=25, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(_('Phone Number'), max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(_('Date of Birth'), null=True, blank=True)
    address = models.TextField(_('Address'), blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

class PatientProfile(models.Model):
    """
    Extended profile information for patients
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_number = models.CharField(max_length=15, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return f"Patient Profile: {self.user.username}"

class HealthcareProfessionalProfile(models.Model):
    """
    Extended profile information for healthcare professionals
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='healthcare_profile')
    specialization = models.CharField(max_length=100, blank=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    license_valid_until = models.DateField(blank=True, null=True)
    license_document = models.FileField(upload_to='license_documents/', blank=True, null=True)
    is_license_verified = models.BooleanField(default=False)
    years_of_experience = models.PositiveIntegerField(default=0)
    qualification = models.CharField(max_length=100, blank=True, null=True)
    institution = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Healthcare Profile: {self.user.username}"

    def is_available_for_appointments(self):
        return self.is_license_verified

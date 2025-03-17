from django.db import models

# Create your models here.

class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
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

class Document(models.Model):
    # Optional: associate a document with a user
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    date = models.DateField()
    file_url = models.URLField()

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

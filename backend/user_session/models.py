from django.db import models

# Create your models here.

class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
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

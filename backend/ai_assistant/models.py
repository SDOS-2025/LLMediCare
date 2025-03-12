from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class ChatSession(models.Model):
    """
    Model for storing AI chat sessions
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat Session {self.id} - {self.user.username}"

class ChatMessage(models.Model):
    """
    Model for storing chat messages
    """
    MESSAGE_TYPES = (
        ('user', 'User Message'),
        ('assistant', 'Assistant Message'),
        ('system', 'System Message'),
    )
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.message_type.capitalize()} Message - {self.session.id}"

class AgentAction(models.Model):
    """
    Model for storing AI agent actions
    """
    ACTION_TYPES = (
        ('appointment_scheduling', 'Appointment Scheduling'),
        ('medication_reminder', 'Medication Reminder'),
        ('symptom_analysis', 'Symptom Analysis'),
        ('health_recommendation', 'Health Recommendation'),
        ('medical_report_analysis', 'Medical Report Analysis'),
        ('other', 'Other')
    )
    
    ACTION_STATUS = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled')
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='agent_actions'
    )
    action_type = models.CharField(max_length=30, choices=ACTION_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=15, choices=ACTION_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    result = models.TextField(blank=True, null=True)
    parameters = models.JSONField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.action_type} - {self.user.username}"

class HealthRecommendation(models.Model):
    """
    Model for storing personalized health recommendations
    """
    RECOMMENDATION_TYPES = (
        ('diet', 'Diet'),
        ('exercise', 'Exercise'),
        ('lifestyle', 'Lifestyle'),
        ('preventive', 'Preventive Care'),
        ('mental_health', 'Mental Health'),
        ('other', 'Other')
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='health_recommendations'
    )
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.user.username}"

class SymptomCheck(models.Model):
    """
    Model for storing symptom check results
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='symptom_checks'
    )
    symptoms = models.TextField()
    analysis = models.TextField()
    possible_conditions = models.JSONField(blank=True, null=True)
    severity_level = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    recommendations = models.TextField(blank=True, null=True)
    seek_medical_attention = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Symptom Check - {self.user.username} - {self.created_at}"

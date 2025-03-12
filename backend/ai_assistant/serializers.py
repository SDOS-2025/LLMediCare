from rest_framework import serializers
from .models import (
    ChatSession,
    ChatMessage,
    AgentAction,
    HealthRecommendation,
    SymptomCheck
)
from users.serializers import UserSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for chat messages
    """
    class Meta:
        model = ChatMessage
        fields = ('id', 'session', 'content', 'message_type', 'created_at', 'metadata')
        read_only_fields = ('created_at',)

class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for chat sessions
    """
    messages = ChatMessageSerializer(many=True, read_only=True)
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ('id', 'user', 'user_details', 'title', 'created_at', 'updated_at', 'is_active', 'messages')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_user_details(self, obj):
        return UserSerializer(obj.user).data

class ChatSessionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating chat sessions
    """
    initial_message = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = ChatSession
        fields = ('user', 'title', 'initial_message')
    
    def create(self, validated_data):
        initial_message = validated_data.pop('initial_message', None)
        
        # Create the chat session
        chat_session = ChatSession.objects.create(**validated_data)
        
        # If an initial message was provided, add it to the session
        if initial_message:
            ChatMessage.objects.create(
                session=chat_session,
                content=initial_message,
                message_type='user'
            )
            
            # Generate an AI response (will be implemented in the service class)
            # This is just a placeholder response
            system_response = "Hello! I'm your healthcare assistant. How can I help you today?"
            ChatMessage.objects.create(
                session=chat_session,
                content=system_response,
                message_type='assistant'
            )
        
        return chat_session

class AgentActionSerializer(serializers.ModelSerializer):
    """
    Serializer for agent actions
    """
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = AgentAction
        fields = ('id', 'user', 'user_details', 'action_type', 'description', 'status', 
                  'created_at', 'updated_at', 'result', 'parameters', 'error_message')
        read_only_fields = ('created_at', 'updated_at', 'result', 'error_message')
    
    def get_user_details(self, obj):
        return UserSerializer(obj.user).data

class HealthRecommendationSerializer(serializers.ModelSerializer):
    """
    Serializer for health recommendations
    """
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthRecommendation
        fields = ('id', 'user', 'user_details', 'recommendation_type', 'title', 
                  'description', 'created_at', 'is_read', 'is_active', 'source')
        read_only_fields = ('created_at',)
    
    def get_user_details(self, obj):
        return UserSerializer(obj.user).data

class SymptomCheckSerializer(serializers.ModelSerializer):
    """
    Serializer for symptom check
    """
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = SymptomCheck
        fields = ('id', 'user', 'user_details', 'symptoms', 'analysis', 'possible_conditions', 
                  'severity_level', 'created_at', 'recommendations', 'seek_medical_attention')
        read_only_fields = ('created_at', 'analysis', 'possible_conditions', 
                            'severity_level', 'recommendations', 'seek_medical_attention')
    
    def get_user_details(self, obj):
        return UserSerializer(obj.user).data

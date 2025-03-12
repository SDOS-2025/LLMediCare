from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.conf import settings

from .models import (
    ChatSession,
    ChatMessage,
    AgentAction,
    HealthRecommendation,
    SymptomCheck
)
from .serializers import (
    ChatSessionSerializer,
    ChatSessionCreateSerializer,
    ChatMessageSerializer,
    AgentActionSerializer,
    HealthRecommendationSerializer,
    SymptomCheckSerializer
)
from .services import AIAssistantService
from users.permissions import IsOwnerOrReadOnly

class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat sessions
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['updated_at', 'created_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """
        Return chat sessions for the current user
        """
        return ChatSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return ChatSessionCreateSerializer
        return ChatSessionSerializer
    
    def perform_create(self, serializer):
        """
        Create a new chat session
        """
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """
        Send a message to a chat session and get AI response
        """
        session = self.get_object()
        message_content = request.data.get('content')
        
        if not message_content:
            return Response(
                {'detail': 'Message content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process message with AI assistant
        ai_service = AIAssistantService(user=request.user)
        ai_response = ai_service.process_message(session, message_content)
        
        # Update session
        session.save()  # This updates the updated_at field
        
        return Response({
            'user_message': ChatMessageSerializer(ChatMessage.objects.filter(
                session=session,
                content=message_content,
                message_type='user'
            ).latest('created_at')).data,
            'ai_response': ChatMessageSerializer(ai_response).data
        })
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Get all messages for a chat session
        """
        session = self.get_object()
        messages = session.messages.all().order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

class AgentActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving agent actions
    """
    serializer_class = AgentActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['action_type', 'description']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return agent actions for the current user
        """
        return AgentAction.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Filter agent actions by type
        """
        action_type = request.query_params.get('type')
        if not action_type:
            return Response(
                {'detail': 'Action type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(action_type=action_type)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get pending agent actions
        """
        queryset = self.get_queryset().filter(
            status__in=['pending', 'in_progress']
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class HealthRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving health recommendations
    """
    serializer_class = HealthRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'recommendation_type']
    ordering_fields = ['created_at', 'recommendation_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return health recommendations for the current user
        """
        return HealthRecommendation.objects.filter(user=self.request.user, is_active=True)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a health recommendation as read
        """
        recommendation = self.get_object()
        recommendation.is_read = True
        recommendation.save()
        serializer = self.get_serializer(recommendation)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Get unread health recommendations
        """
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Filter health recommendations by type
        """
        recommendation_type = request.query_params.get('type')
        if not recommendation_type:
            return Response(
                {'detail': 'Recommendation type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(recommendation_type=recommendation_type)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class SymptomCheckViewSet(viewsets.ModelViewSet):
    """
    ViewSet for symptom checking
    """
    serializer_class = SymptomCheckSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return symptom checks for the current user
        """
        return SymptomCheck.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """
        Create a new symptom check
        """
        serializer.save(user=self.request.user)
        
        # Process symptoms with AI service after saving
        symptom_check = serializer.instance
        ai_service = AIAssistantService(user=self.request.user)
        analysis = ai_service._handle_symptom_check(symptom_check.symptoms)
        
        # Update symptom check with analysis result
        symptom_check.analysis = analysis
        symptom_check.save()
    
    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """
        Analyze symptoms directly without saving
        """
        symptoms = request.data.get('symptoms')
        if not symptoms:
            return Response(
                {'detail': 'Symptoms are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ai_service = AIAssistantService(user=request.user)
        analysis = ai_service._handle_symptom_check(symptoms)
        
        return Response({
            'symptoms': symptoms,
            'analysis': analysis
        })

from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime, timedelta

from .models import MedicalRecord, MedicalDocument, Medication, MedicationReminder
from .serializers import (
    MedicalRecordSerializer,
    MedicalRecordCreateSerializer,
    MedicalDocumentSerializer,
    MedicationSerializer,
    MedicationCreateSerializer,
    MedicationReminderSerializer
)
from users.permissions import IsOwnerOrReadOnly

class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medical records
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'record_type']
    ordering_fields = ['date_recorded', 'record_type', 'created_at']
    ordering = ['-date_recorded']
    
    def get_queryset(self):
        """
        Return medical records based on user type
        """
        user = self.request.user
        if user.user_type == 'patient':
            return MedicalRecord.objects.filter(patient=user, is_active=True)
        elif user.user_type == 'healthcare_professional':
            # Healthcare professionals can see records they created or for patients they have appointments with
            return MedicalRecord.objects.filter(
                Q(healthcare_professional=user) | 
                Q(patient__patient_appointments__healthcare_professional=user)
            ).distinct().filter(is_active=True)
        return MedicalRecord.objects.none()
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return MedicalRecordCreateSerializer
        return MedicalRecordSerializer
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Filter medical records by type
        """
        record_type = request.query_params.get('type')
        if not record_type:
            return Response(
                {'detail': 'Record type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(record_type=record_type)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """
        Filter medical records by date range
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'detail': 'Both start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'detail': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(date_recorded__range=[start_date, end_date])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class MedicalDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medical documents
    """
    serializer_class = MedicalDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return medical documents based on user type
        """
        user = self.request.user
        if user.user_type == 'patient':
            return MedicalDocument.objects.filter(medical_record__patient=user)
        elif user.user_type == 'healthcare_professional':
            # Healthcare professionals can see documents for records they created or for patients they have appointments with
            return MedicalDocument.objects.filter(
                Q(medical_record__healthcare_professional=user) | 
                Q(medical_record__patient__patient_appointments__healthcare_professional=user)
            ).distinct()
        return MedicalDocument.objects.none()

class MedicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medications
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'instructions']
    ordering_fields = ['start_date', 'name', 'created_at']
    ordering = ['-start_date']
    
    def get_queryset(self):
        """
        Return medications based on user type
        """
        user = self.request.user
        if user.user_type == 'patient':
            return Medication.objects.filter(patient=user, is_active=True)
        elif user.user_type == 'healthcare_professional':
            # Healthcare professionals can see medications they prescribed or for patients they have appointments with
            return Medication.objects.filter(
                Q(prescribed_by=user) | 
                Q(patient__patient_appointments__healthcare_professional=user)
            ).distinct().filter(is_active=True)
        return Medication.objects.none()
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return MedicationCreateSerializer
        return MedicationSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        List active medications (current)
        """
        today = datetime.today().date()
        queryset = self.get_queryset().filter(
            Q(end_date__isnull=True) | Q(end_date__gte=today)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a medication
        """
        medication = self.get_object()
        medication.is_active = False
        medication.save()
        serializer = self.get_serializer(medication)
        return Response(serializer.data)

class MedicationReminderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving medication reminders
    """
    serializer_class = MedicationReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return medication reminders based on user type
        """
        user = self.request.user
        if user.user_type == 'patient':
            return MedicationReminder.objects.filter(medication__patient=user)
        return MedicationReminder.objects.none()
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        Get today's medication reminders
        """
        today = datetime.today().date()
        reminders = self.get_queryset().filter(
            medication__is_active=True,
            medication__start_date__lte=today
        ).filter(
            Q(medication__end_date__isnull=True) | Q(medication__end_date__gte=today)
        ).order_by('reminder_time')
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)

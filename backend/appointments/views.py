from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime, timedelta

from .models import Appointment, AvailabilitySlot, Reminder
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer, 
    AppointmentUpdateSerializer,
    AvailabilitySlotSerializer, 
    ReminderSerializer
)
from users.permissions import IsOwnerOrReadOnly

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments
    """
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reason', 'notes']
    ordering_fields = ['date', 'start_time', 'status', 'created_at']
    ordering = ['-date', 'start_time']
    
    def get_queryset(self):
        """
        Return appointments based on user type
        """
        user = self.request.user
        if user.user_type == 'patient':
            return Appointment.objects.filter(patient=user)
        elif user.user_type == 'healthcare_professional':
            return Appointment.objects.filter(healthcare_professional=user)
        return Appointment.objects.none()
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        List upcoming appointments for a user
        """
        today = datetime.today().date()
        user = request.user
        
        if user.user_type == 'patient':
            appointments = Appointment.objects.filter(
                patient=user,
                date__gte=today,
                status__in=['pending', 'confirmed']
            ).order_by('date', 'start_time')
        else:
            appointments = Appointment.objects.filter(
                healthcare_professional=user,
                date__gte=today,
                status__in=['pending', 'confirmed']
            ).order_by('date', 'start_time')
        
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """
        List past appointments for a user
        """
        today = datetime.today().date()
        user = request.user
        
        if user.user_type == 'patient':
            appointments = Appointment.objects.filter(
                Q(patient=user) & 
                (Q(date__lt=today) | Q(status='completed'))
            ).order_by('-date', 'start_time')
        else:
            appointments = Appointment.objects.filter(
                Q(healthcare_professional=user) & 
                (Q(date__lt=today) | Q(status='completed'))
            ).order_by('-date', 'start_time')
        
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an appointment
        """
        appointment = self.get_object()
        
        # Check if the appointment is already completed
        if appointment.status == 'completed':
            return Response(
                {'detail': 'Cannot cancel a completed appointment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark an appointment as completed
        """
        appointment = self.get_object()
        
        # Only healthcare professionals can mark appointments as completed
        if request.user.user_type != 'healthcare_professional':
            return Response(
                {'detail': 'Only healthcare professionals can mark appointments as completed.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the appointment is already cancelled
        if appointment.status == 'cancelled':
            return Response(
                {'detail': 'Cannot complete a cancelled appointment.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing availability slots
    """
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return availability slots based on user type
        """
        user = self.request.user
        if user.user_type == 'healthcare_professional':
            return AvailabilitySlot.objects.filter(healthcare_professional=user)
        else:
            # Patients can only view available slots
            return AvailabilitySlot.objects.filter(is_available=True)
    
    def perform_create(self, serializer):
        """
        Set the healthcare professional to the current user
        """
        if self.request.user.user_type != 'healthcare_professional':
            return Response(
                {'detail': 'Only healthcare professionals can create availability slots.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save(healthcare_professional=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available_for_professional(self, request):
        """
        List available slots for a specific healthcare professional
        """
        professional_id = request.query_params.get('professional_id')
        if not professional_id:
            return Response(
                {'detail': 'Professional ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        slots = AvailabilitySlot.objects.filter(
            healthcare_professional_id=professional_id,
            is_available=True
        ).order_by('day_of_week', 'start_time')
        
        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)

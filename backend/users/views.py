from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import User, PatientProfile, HealthcareProfessionalProfile
from .serializers import (
    UserSerializer, 
    PatientProfileSerializer, 
    HealthcareProfessionalProfileSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer,
    PatientProfileUpdateSerializer,
    HealthcareProfessionalProfileUpdateSerializer
)
from .permissions import IsOwnerOrReadOnly

class UserRegistrationView(generics.CreateAPIView):
    """
    API view for user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    """
    API view for user login
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            return Response(
                {'error': 'Invalid credentials, please try again'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        })

class UserLogoutView(APIView):
    """
    API view for user logout
    """
    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserProfileView(APIView):
    """
    API view for retrieving and updating user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        
        if user.user_type == 'patient':
            profile = get_object_or_404(PatientProfile, user=user)
            profile_data = PatientProfileSerializer(profile).data
        else:
            profile = get_object_or_404(HealthcareProfessionalProfile, user=user)
            profile_data = HealthcareProfessionalProfileSerializer(profile).data
        
        return Response({
            'user': user_data,
            'profile': profile_data
        })
    
    @transaction.atomic
    def put(self, request):
        user = request.user
        user_serializer = UserProfileUpdateSerializer(user, data=request.data.get('user', {}), partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()
        
        if user.user_type == 'patient':
            profile = get_object_or_404(PatientProfile, user=user)
            profile_serializer = PatientProfileUpdateSerializer(profile, data=request.data.get('profile', {}), partial=True)
        else:
            profile = get_object_or_404(HealthcareProfessionalProfile, user=user)
            profile_serializer = HealthcareProfessionalProfileUpdateSerializer(profile, data=request.data.get('profile', {}), partial=True)
        
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'profile': profile_serializer.data
        })

class HealthcareProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing healthcare professionals
    """
    queryset = User.objects.filter(user_type='healthcare_professional')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        user = self.get_object()
        profile = get_object_or_404(HealthcareProfessionalProfile, user=user)
        serializer = HealthcareProfessionalProfileSerializer(profile)
        return Response(serializer.data)

class PatientProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for healthcare professionals to view patient profiles
    """
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'healthcare_professional':
            return PatientProfile.objects.all()
        return PatientProfile.objects.filter(user=user)

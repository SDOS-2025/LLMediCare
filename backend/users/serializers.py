from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PatientProfile, HealthcareProfessionalProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the custom user model"""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 
                  'user_type', 'phone_number', 'date_of_birth', 'address', 'profile_picture')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer for patient profile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = ('id', 'user', 'blood_group', 'allergies', 'emergency_contact_name', 
                  'emergency_contact_number', 'emergency_contact_relationship')

class HealthcareProfessionalProfileSerializer(serializers.ModelSerializer):
    """Serializer for healthcare professional profile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = HealthcareProfessionalProfile
        fields = ('id', 'user', 'specialization', 'license_number', 'license_valid_until',
                  'license_document', 'is_license_verified', 'years_of_experience',
                  'qualification', 'institution', 'bio')

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'first_name', 
                  'last_name', 'user_type', 'phone_number', 'date_of_birth', 'address')
    
    def validate(self, data):
        if data['password'] != data.pop('confirm_password'):
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        
        # Create corresponding profile based on user type
        if user.user_type == 'patient':
            PatientProfile.objects.create(user=user)
        elif user.user_type == 'healthcare_professional':
            HealthcareProfessionalProfile.objects.create(user=user)
            
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'address', 'profile_picture')

class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating patient profile"""
    
    class Meta:
        model = PatientProfile
        fields = ('blood_group', 'allergies', 'emergency_contact_name', 
                  'emergency_contact_number', 'emergency_contact_relationship')

class HealthcareProfessionalProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating healthcare professional profile"""
    
    class Meta:
        model = HealthcareProfessionalProfile
        fields = ('specialization', 'license_number', 'license_valid_until',
                  'license_document', 'years_of_experience', 'qualification', 
                  'institution', 'bio')

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from .models import User, Session, MedicalRecord, Document, Medication
from .serializers import UserSerializer, SessionSerializer, MedicalRecordSerializer, DocumentSerializer, MedicationSerializer
from .models import Appointment
from .serializers import AppointmentSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on the User model using email as the unique identifier.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = "email"  # Use email instead of id

    def create(self, request, *args, **kwargs):
        """Create a new User"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Update an existing User (PATCH for partial updates)"""
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Delete a User by email"""
        user = self.get_object()
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='fetch-by-email')
    def fetch_by_email(self, request):
        """Fetch user details by email (GET /api/users/fetch-by-email/?email=example@email.com)"""
        user_email = request.query_params.get("email")
        if not user_email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(User, email=user_email)
        return Response(UserSerializer(user).data)


class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on the Session model.
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def create(self, request, *args, **kwargs):
        """Create a new Session for a user identified by email"""
        try:
            print(f"Request data: {request.data}")
            user_email = request.data.get("user_email")
            
            if not user_email:
                print("No user_email provided in request data")
                return Response({"error": "User email is required"}, status=status.HTTP_400_BAD_REQUEST)
                
            print(f"Creating session for user email: {user_email}")
                
            # Ensure user exists or create a new one
            try:
                user = User.objects.get(email=user_email)
                print(f"Found existing user: {user.id} - {user.email}")
            except User.DoesNotExist:
                # Create a basic user if not exists
                print(f"User not found, creating new user with email: {user_email}")
                user = User.objects.create(
                    name=user_email.split('@')[0],  # Simple name from email
                    email=user_email
                )
                print(f"Created new user: {user.id} - {user.email}")
                
            # Create a new empty session for this user
            session = Session.objects.create(
                user_email=user,
                session_chats=[]
            )
            
            print(f"Created new session: {session.id} for user: {user.email}")
            
            # Prepare response data
            response_data = SessionSerializer(session).data
            print(f"Returning session data: {response_data}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating session: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def add_chat(self, request, pk=None):
        """Add a chat message to session_chats"""
        try:
            print(f"Add chat request for session {pk} with data: {request.data}")
            session = self.get_object()
            print(f"Found session: {session.id}")
            
            message = request.data.get("message")
            
            if not message:
                print("No message provided in request data")
                return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Message to add: {message}")
            
            # Initialize session_chats if it's None
            if session.session_chats is None:
                print("Initializing empty session_chats")
                session.session_chats = []
            
            # Add the message to session_chats
            session.session_chats.append(message)
            print(f"Updated session_chats, now contains {len(session.session_chats)} messages")
            
            # Save the session
            session.save(update_fields=["session_chats"])
            print("Session saved successfully")
            
            # Prepare response data
            response_data = SessionSerializer(session).data
            
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error adding chat message: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to add chat message: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'])
    def clear_chats(self, request, pk=None):
        """Clear all chat messages from a session"""
        try:
            session = self.get_object()
            session.session_chats = []
            session.save(update_fields=["session_chats"])
            return Response(
                {"message": "Chat history cleared successfully", "session_chats": []}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to clear chats: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Update an existing Session (PATCH for partial updates)"""
        session = self.get_object()
        serializer = self.get_serializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a Session"""
        session = self.get_object()
        session.delete()
        return Response({"message": "Session deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def user_sessions(self, request):
        """Get all sessions for a specific user (by email)"""
        try:
            print(f"user_sessions called with query params: {request.query_params}")
            user_email = request.query_params.get("email")
            
            if not user_email:
                print("No email parameter provided")
                return Response({"error": "User email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Looking for sessions for user email: {user_email}")
                
            # Find the user
            try:
                user = User.objects.get(email=user_email)
                print(f"Found user: {user.id} - {user.email}")
            except User.DoesNotExist:
                print(f"No user found with email: {user_email}")
                # Return empty list if user doesn't exist
                return Response([])
                
            # Get all sessions for this user, ordered by most recent first
            sessions = Session.objects.filter(user_email=user).order_by('-created_at')
            print(f"Found {sessions.count()} sessions")
            
            # Serialize the sessions
            serialized_sessions = SessionSerializer(sessions, many=True).data
            print(f"Returning {len(serialized_sessions)} serialized sessions")
            
            return Response(serialized_sessions)
        except Exception as e:
            print(f"Error fetching user sessions: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to fetch user sessions: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
def get_records(request):
    records = MedicalRecord.objects.all()
    documents = Document.objects.all()
    medications = Medication.objects.all()

    record_serializer = MedicalRecordSerializer(records, many=True)
    document_serializer = DocumentSerializer(documents, many=True)
    medication_serializer = MedicationSerializer(medications, many=True)

    return Response({
        'records': record_serializer.data,
        'documents': document_serializer.data,
        'medications': medication_serializer.data,
    })


@api_view(['POST'])
def add_medication(request):
    """
    API endpoint to add a new medication record.
    Expects a JSON payload with the medication details.
    """
    serializer = MedicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # You can pass additional parameters, e.g., associate with request.user if needed.
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_medical_record(request):
    """
    API endpoint to add a new medical record.
    Expects a JSON payload with the fields:
      - date (YYYY-MM-DD)
      - type
      - doctor
      - findings
      - recommendations
    """
    serializer = MedicalRecordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Optionally, assign a user here if needed.
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_document(request):
    """
    API endpoint to add a new document.
    Expects a JSON payload with the following fields:
      - title: string
      - type: string (e.g., 'test_result', 'imaging', etc.)
      - date: date in YYYY-MM-DD format
      - file_url: URL of the uploaded document file
    """
    serializer = DocumentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Optionally, you can associate the document with a user here
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on Appointments.
    Patients can create an appointment by selecting a doctor.
    Doctors only see the appointments booked with them.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        # Filter appointments based on provided email query param.
        user_email = self.request.query_params.get("email")
        if user_email:
            user = get_object_or_404(User, email=user_email)
            if user.role == "doctor":
                return Appointment.objects.filter(doctor=user)
            else:
                return Appointment.objects.filter(patient=user)
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        """
        For patients: create an appointment by providing the doctor’s email, appointment_date, times, etc.
        The patient is attached automatically from the email query parameter.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Expect the patient's email to be provided as a query parameter
            patient_email = request.query_params.get("email")
            if patient_email:
                patient = get_object_or_404(User, email=patient_email)
                appointment = serializer.save(patient=patient)
            else:
                appointment = serializer.save()
            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Custom permission classes
class IsDoctor(permissions.BasePermission):
    """
    Custom permission to only allow doctors to access or modify the resource.
    """
    def has_permission(self, request, view):
        # Check if user exists and has role 'doctor'
        return request.user and hasattr(request.user, 'role') and request.user.role == 'doctor'

class IsPatient(permissions.BasePermission):
    """
    Custom permission to only allow patients to access or modify the resource.
    """
    def has_permission(self, request, view):
        # Check if user exists and has role 'patient'
        return request.user and hasattr(request.user, 'role') and request.user.role == 'patient'

class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint for medical records.
    Doctors can create/modify medical records.
    Patients can only view their own medical records.
    """
    serializer_class = MedicalRecordSerializer
    
    def get_permissions(self):
        """
        - Doctors can perform all operations
        - Patients can only list and retrieve their own records
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsDoctor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Doctors can see all medical records
        if user.role == 'doctor':
            return MedicalRecord.objects.all()
        # Patients can only see their own records
        elif user.role == 'patient':
            return MedicalRecord.objects.filter(user=user)
        return MedicalRecord.objects.none()
    
    def perform_create(self, serializer):
        """Ensure only doctors can create medical records"""
        if self.request.user.role != 'doctor':
            return Response(
                {"detail": "Only doctors can create medical records."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for documents.
    Patients can upload/modify documents.
    Doctors can view and download documents.
    """
    serializer_class = DocumentSerializer
    
    def get_permissions(self):
        """
        - Patients can perform create/update/delete operations
        - Doctors can only list and retrieve
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsPatient]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Doctors can view all documents
        if user.role == 'doctor':
            return Document.objects.all()
        # Patients can only see their own documents
        elif user.role == 'patient':
            return Document.objects.filter(user=user)
        return Document.objects.none()
    
    def perform_create(self, serializer):
        """Associate the document with the current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Endpoint for doctors to download documents
        """
        document = self.get_object()
        
        # Only doctors can download
        if request.user.role != 'doctor':
            return Response(
                {"detail": "Only doctors can download documents."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # In a real implementation, you would handle the file download here
        # For this example, we'll just return the file URL
        return Response({"file_url": document.file_url})

class MedicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for medications.
    Doctors can create/modify medications.
    Patients can only view their prescribed medications.
    """
    serializer_class = MedicationSerializer
    
    def get_permissions(self):
        """
        - Doctors can perform all operations
        - Patients can only list and retrieve their own medications
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsDoctor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Doctors can see all medications
        if user.role == 'doctor':
            return Medication.objects.all()
        # Patients can only see their own medications
        elif user.role == 'patient':
            return Medication.objects.filter(user=user)
        return Medication.objects.none()
    
    def perform_create(self, serializer):
        """Ensure only doctors can create medications"""
        if self.request.user.role != 'doctor':
            return Response(
                {"detail": "Only doctors can prescribe medications."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
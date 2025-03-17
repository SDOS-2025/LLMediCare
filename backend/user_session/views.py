from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from .models import User, Session, MedicalRecord, Document, Medication
from .serializers import UserSerializer, SessionSerializer, MedicalRecordSerializer, DocumentSerializer, MedicationSerializer

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
        user_email = request.data.get("user_email")
        # Ensure user exists
        user = get_object_or_404(User, email=user_email)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(user_email=user)
            return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_chat(self, request, pk=None):
        """Add a chat message to session_chats"""
        session = self.get_object()
        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        session.session_chats.append(message)
        session.save(update_fields=["session_chats"])
        return Response(SessionSerializer(session).data, status=status.HTTP_200_OK)

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
        user_email = request.query_params.get("email")
        if not user_email:
            return Response({"error": "User email is required"}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(User, email=user_email)
        sessions = Session.objects.filter(user_email=user)
        return Response(SessionSerializer(sessions, many=True).data)


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
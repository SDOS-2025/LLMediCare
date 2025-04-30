import factory
from factory.django import DjangoModelFactory
from django.utils import timezone
from datetime import timedelta
from .models import User, Session, MedicalRecord, Document, Medication, Appointment, Notification

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    name = factory.Faker('name')
    email = factory.Faker('email')
    role = 'patient'
    medical_records = []
    profile_pic = None
    verified = False


class DoctorFactory(UserFactory):
    role = 'doctor'


class SessionFactory(DjangoModelFactory):
    class Meta:
        model = Session

    user_email = factory.SubFactory(UserFactory)
    session_chats = []


class MedicalRecordFactory(DjangoModelFactory):
    class Meta:
        model = MedicalRecord

    user = factory.SubFactory(UserFactory)
    date = factory.LazyFunction(timezone.now().date)
    type = factory.Faker('word')
    doctor = factory.Faker('name')
    findings = factory.Faker('text', max_nb_chars=100)
    recommendations = factory.Faker('text', max_nb_chars=100)


class DocumentFactory(DjangoModelFactory):
    class Meta:
        model = Document

    user = factory.SubFactory(UserFactory)
    title = factory.Faker('sentence', nb_words=3)
    type = factory.Faker('word')
    date = factory.LazyFunction(timezone.now().date)
    file = factory.Faker('text', max_nb_chars=100)  # Base64 encoded string in real case


class MedicationFactory(DjangoModelFactory):
    class Meta:
        model = Medication

    user = factory.SubFactory(UserFactory)
    name = factory.Faker('word')
    dosage = factory.LazyAttribute(lambda x: f"{factory.random.randint(10, 500)}mg")
    frequency = factory.LazyAttribute(lambda x: f"{factory.random.randint(1, 3)} times daily")
    start_date = factory.LazyFunction(timezone.now().date)
    end_date = factory.LazyAttribute(lambda x: timezone.now().date() + timedelta(days=factory.random.randint(7, 30)))
    instructions = factory.Faker('text', max_nb_chars=100)


class AppointmentFactory(DjangoModelFactory):
    class Meta:
        model = Appointment

    patient = factory.SubFactory(UserFactory, role='patient')
    doctor = factory.SubFactory(UserFactory, role='doctor')
    appointment_date = factory.LazyAttribute(lambda x: timezone.now().date() + timedelta(days=factory.random.randint(1, 14)))
    start_time = factory.LazyAttribute(lambda x: f"{factory.random.randint(8, 16)}:00:00")
    end_time = factory.LazyAttribute(lambda x: f"{factory.random.randint(9, 17)}:00:00")
    notes = factory.Faker('text', max_nb_chars=100)
    status = 'pending'


class NotificationFactory(DjangoModelFactory):
    class Meta:
        model = Notification

    user = factory.SubFactory(UserFactory)
    title = factory.Faker('sentence', nb_words=4)
    message = factory.Faker('text', max_nb_chars=100)
    created_at = factory.LazyFunction(timezone.now)
    read = False
    type = 'reminder'
    appointment = None
    medical_record = None
    medication = None
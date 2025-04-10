from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.process_query, name='process_query'),
    path('clear/', views.clear_conversation, name='clear_conversation'),
    path('process-medical-report/', views.process_medical_report, name='process_medical_report'),
]

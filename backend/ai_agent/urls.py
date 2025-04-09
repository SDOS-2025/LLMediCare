from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.process_query, name='process_query'),
    path('clear/', views.clear_conversation, name='clear_conversation'),
]

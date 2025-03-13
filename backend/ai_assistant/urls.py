from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChatSessionViewSet,
    AgentActionViewSet,
    HealthRecommendationViewSet,
    SymptomCheckViewSet,
    ModelStatusView,
)

router = DefaultRouter()
router.register(r'chat-sessions', ChatSessionViewSet, basename='chat-session')
router.register(r'agent-actions', AgentActionViewSet, basename='agent-action')
router.register(r'health-recommendations', HealthRecommendationViewSet, basename='health-recommendation')
router.register(r'symptom-checks', SymptomCheckViewSet, basename='symptom-check')

urlpatterns = [
    path('', include(router.urls)),
    path('model/status/', ModelStatusView.as_view(), name='model-status'),
]

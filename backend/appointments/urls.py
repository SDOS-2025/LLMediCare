from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, AvailabilitySlotViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'availability-slots', AvailabilitySlotViewSet, basename='availability-slot')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView, MyTokenObtainPairView, BookingListView, VehicleListView

urlpatterns = [
    # Rutas de JWT (Login y refrescar token)
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas de usuario
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    
    path('bookings/', BookingListView.as_view(), name='booking-list'),
    
    path('vehicles/', VehicleListView.as_view(), name='vehicle-list'),
]
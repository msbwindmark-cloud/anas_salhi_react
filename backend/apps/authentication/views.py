from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, RegisterSerializer, MyTokenObtainPairSerializer, BookingSerializer, VehicleSerializer
from .models import User, Booking, Vehicle

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Cualquiera puede registrarse
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # ¡SOLO SI TIENE TOKEN!

    def get_object(self):
        return self.request.user

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

class BookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().order_by('date', 'time')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated] # Solo usuarios logueados pueden verlas
    

# No olvides importar Vehicle y VehicleSerializer arriba
class VehicleListView(generics.ListAPIView):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
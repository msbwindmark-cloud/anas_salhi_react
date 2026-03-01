from rest_framework import serializers
from .models import User, Booking, Driver, Vehicle, Client, Excursion, Provider
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'date_joined', 'is_superuser']
        read_only_fields = ['id', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone']

    def create(self, validated_data):
        # Aquí es donde la magia de la encriptación sucede
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', '')
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Añadimos la información al "payload" del JWT (lo que lee jwt-decode)
        token['is_superuser'] = user.is_superuser
        token['first_name'] = user.first_name
        token['email'] = user.email

        return token
    


# Estos serializers convierten los modelos en datos que React entiende
class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['name', 'phone']

class BookingSerializer(serializers.ModelSerializer):
    driver_name = serializers.ReadOnlyField(source='driver.name')
    vehicle_plate = serializers.ReadOnlyField(source='vehicle.plate_number')
    client_name = serializers.ReadOnlyField(source='client.name')
    # --- NUEVOS CAMPOS ---
    client_phone = serializers.ReadOnlyField(source='client.phone')
    client_email = serializers.ReadOnlyField(source='client.email')
    guide_name = serializers.ReadOnlyField(source='guide.name')
    # ---------------------
    excursion_name = serializers.ReadOnlyField(source='excursion.name')
    agency_name = serializers.ReadOnlyField(source='provider.name')

    class Meta:
        model = Booking
        fields = [
            'id', 'date', 'time', 'driver_name', 'vehicle_plate', 
            'client_name', 'client_phone', 'client_email', # Añadidos
            'num_people', 'excursion_name', 'guide_name',  # Añadido
            'language', 'pickup_address', 'pickup_location_detail',
            'agency_name', 'observations'
        ]
        


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'plate_number', 'model_name', 'capacity']
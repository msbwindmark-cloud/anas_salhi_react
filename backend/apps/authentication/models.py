from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _ # Importante para traducciones
from django.conf import settings


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("L'adresse e-mail doit être configurée"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    # Campos con alias en francés (verbose_name)
    email = models.EmailField(
        unique=True, 
        verbose_name=_("Adresse e-mail")
    )
    first_name = models.CharField(
        max_length=150, 
        blank=True, 
        verbose_name=_("Prénom")
    )
    last_name = models.CharField(
        max_length=150, 
        blank=True, 
        verbose_name=_("Nom de famille")
    )
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True, 
        verbose_name=_("Numéro de téléphone")
    )
    
    ROLE_CHOICES = (
        ('admin', _('Administrateur')),
        ('staff', _('Personnel')),
        ('user', _('Utilisateur standard')),
    )
    role = models.CharField(
        max_length=10, 
        choices=ROLE_CHOICES, 
        default='user',
        verbose_name=_("Rôle")
    )

    is_active = models.BooleanField(default=True, verbose_name=_("Actif"))
    is_staff = models.BooleanField(default=False, verbose_name=_("Accès staff"))
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name=_("Date d'inscription"))

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")

    def __str__(self):
        return self.email
    

#Modelos para el planning

# 1. Agences / Prestataires (GYG, Viator, etc.)
class Provider(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom de l'Agence")

    def __str__(self):
        return self.name

# 2. Clients
class Client(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nom du Client")
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, null=True, verbose_name="E-mail")
    address = models.TextField(blank=True, null=True, verbose_name="Adresse Principale")
    language = models.CharField(max_length=50, blank=True, null=True, verbose_name="Langue préférée")

    def __str__(self):
        return self.name

# 3. Guides (Najib, Mkadem, etc.)
class Guide(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nom du Guide")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    languages = models.CharField(max_length=200, help_text="Ex: Anglais, Espagnol, Français", verbose_name="Langues parlées")

    def __str__(self):
        return self.name

# 4. Véhicules (Minibus)
class Vehicle(models.Model):
    plate_number = models.CharField(max_length=50, unique=True, verbose_name="Matricule")
    model_name = models.CharField(max_length=100, blank=True, verbose_name="Modèle")
    capacity = models.IntegerField(default=17, verbose_name="Capacité")

    def __str__(self):
        return self.plate_number

# 5. Chauffeurs
class Driver(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nom du Chauffeur")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, null=True, verbose_name="E-mail")
    is_active = models.BooleanField(default=True, verbose_name="Actif")

    def __str__(self):
        return self.name

# 6. Prestations (Excursions)
class Excursion(models.Model):
    name = models.CharField(max_length=200, verbose_name="Désignation")
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Prix de base")

    def __str__(self):
        return self.name

# 7. Réservations (Le coeur du système)
class Booking(models.Model):
    LANGUAGE_CHOICES = [
    ('FR', 'Français'),
    ('EN', 'Anglais'),
    ('ES', 'Espagnol'),
    ('IT', 'Italien'),
    ('AR', 'Arabe'),
    ('DE', 'Allemand'),
    ('PT', 'Portugais'),
    ('ZH', 'Chinois'),
    ('JA', 'Japonais'),
    ('RU', 'Russe'),
    ('NL', 'Néerlandais'),
    ('TR', 'Turc'),
    ('KO', 'Coréen'),
    ]
    
    date = models.DateField(verbose_name="Date")
    time = models.TimeField(verbose_name="Heure")
    
    # Relations
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, related_name='bookings', verbose_name="Chauffeur")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, related_name='bookings', verbose_name="Véhicule")
    guide = models.ForeignKey(Guide, on_delete=models.SET_NULL, null=True, related_name='bookings', verbose_name="Guide")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='bookings', verbose_name="Client")
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, verbose_name="Agence")
    excursion = models.ForeignKey(Excursion, on_delete=models.SET_NULL, null=True, verbose_name="Excursion")
    
    # Détails
    num_people = models.IntegerField(default=1, verbose_name="Nombre de personnes")
    language = models.CharField(
        max_length=2, 
        choices=LANGUAGE_CHOICES, 
        default='FR',
        verbose_name="Langue de la prestation"
    )
    
    # Campo 1: El sitio (La columna "Adresse" de tu papel)
    pickup_address = models.CharField(
        max_length=255, 
        verbose_name="Adresse / Lieu de ramassage",
        help_text="Ex: Hotel Rembrandt, Kasbah Rose"
    )
    
    # Campo 2: La ubicación específica (Tu nota a bolígrafo "Localisation de la prise en charge")
    pickup_location_detail = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name="Localisation de la prise en charge",
        help_text="Ex: Porte principale, Réception, Devant le café"
    )
    observations = models.TextField(blank=True, null=True, verbose_name="Observations")

    def __str__(self):
        return f"{self.date} {self.time} - {self.client.name}"
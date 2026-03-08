from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import HistorialEliminacion, User, Booking, Driver, Vehicle, Client, Excursion, Provider, Guide
import json # Asegúrate de tener este import arriba
from decimal import Decimal


modelos_a_vigilar = [User, Booking, Driver, Vehicle, Client, Excursion, Provider, Guide]

@receiver(post_delete)
def log_eliminacion(sender, instance, **kwargs):
    if sender in modelos_a_vigilar:
        try:
            datos_raw = model_to_dict(instance)
            
            # --- ARREGLO PARA EL ERROR DECIMAL ---
            # Convertimos cualquier Decimal a String para que JSON no llore
            datos = json.loads(json.dumps(datos_raw, default=str))
            
            resumen = "ID: " + str(instance.id)
            if hasattr(instance, 'name'): resumen = instance.name
            elif hasattr(instance, 'plate_number'): resumen = instance.plate_number
            elif hasattr(instance, 'email'): resumen = instance.email
            elif sender == Booking:
                resumen = f"Booking {instance.date} - Client: {instance.client.name if instance.client else 'N/A'}"

            # --- LA CLAVE ESTÁ AQUÍ ---
            # Intentamos obtener el usuario que guardamos en el admin
            user_log = getattr(instance, '_usuario_que_borra', None)
            
            # Solo creamos el log si tenemos al usuario O si viene del borrado automático
            if user_log:
                # Si hay usuario (viene del Admin), guardamos con el email
                HistorialEliminacion.objects.create(
                    modelo=sender.__name__,
                    datos_eliminados=datos,
                    datos_legibles=resumen,
                    usuario=str(user_log.email)
                )
            else:
                # Si NO hay usuario, NO creamos el log para no duplicar.
                # Django lo intentará crear solo, pero al entrar aquí y no hacer nada,
                # el registro "Desconocido" desaparecerá para siempre.
                pass
        except Exception as e:
            print(f"Error en log de eliminación: {e}")
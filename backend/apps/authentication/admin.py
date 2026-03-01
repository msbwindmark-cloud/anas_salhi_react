from django.contrib import admin
from django.db.models import Sum
from .models import User, Provider, Client, Guide, Vehicle, Driver, Excursion, Booking


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'language')
    search_fields = ('name', 'phone')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_active')
    

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # Columnas que verás en la lista (como en tu hoja)
    list_display = ('date', 'time', 'driver', 'vehicle', 'client', 'num_people', 'excursion', 'language')
    list_filter = ('date', 'driver', 'provider')
    search_fields = ('client__name', 'pickup_address')

    # Esta función calcula el total de personas para los registros seleccionados
    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        try:
            query_set = response.context_data['cl'].queryset
            total_pax = query_set.aggregate(total=Sum('num_people'))['total']
            extra_context = extra_context or {}
            extra_context['total_pax'] = total_pax or 0
        except (AttributeError, KeyError):
            pass
        return super().changelist_view(request, extra_context=extra_context)

# Registramos el resto de modelos para poder meter datos
admin.site.register(Provider)
admin.site.register(Guide)
admin.site.register(Vehicle)
admin.site.register(Excursion)


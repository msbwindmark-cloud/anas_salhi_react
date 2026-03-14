from django.contrib import admin
from django.db.models import Sum
from .models import User, Provider, Client, Guide, Vehicle, Driver, Excursion, Booking, HistorialEliminacion, Location, ClientAddress
import json
from django.utils.safestring import mark_safe
from django.utils.html import format_html # Importa esto arriba del todo


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    
    def delete_model(self, request, obj):
        # 1. Pegamos el usuario al objeto
        obj._usuario_que_borra = request.user
        # 2. Forzamos el guardado del log manualmente ANTES de borrar el objeto
        # Importamos la función aquí para evitar errores
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        # 3. Ahora sí, borramos normal
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()

@admin.register(ClientAddress)
class ClientAddressAdmin(admin.ModelAdmin):
    list_display = ('name', 'city')
    search_fields = ('name', 'city', 'full_address')

    # Lógica de borrado seguro para las direcciones
    def delete_model(self, request, obj):
        obj._usuario_que_borra = request.user
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        from .signals import log_eliminacion
        for obj in queryset:
            obj._usuario_que_borra = request.user
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()
        
@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'language', 'provider','client_address_link', 'excursion')
    list_filter = ('provider', 'language', 'excursion')
    search_fields = ('name', 'phone', 'client_address_link__name')
    
    def delete_model(self, request, obj):
        # 1. Pegamos el usuario al objeto
        obj._usuario_que_borra = request.user
        # 2. Forzamos el guardado del log manualmente ANTES de borrar el objeto
        # Importamos la función aquí para evitar errores
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        # 3. Ahora sí, borramos normal
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_active')
    
    def delete_model(self, request, obj):
        # 1. Pegamos el usuario al objeto
        obj._usuario_que_borra = request.user
        # 2. Forzamos el guardado del log manualmente ANTES de borrar el objeto
        # Importamos la función aquí para evitar errores
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        # 3. Ahora sí, borramos normal
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'gps_coordinates')
    search_fields = ('name', 'address')

    def delete_model(self, request, obj):
        obj._usuario_que_borra = request.user
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()   

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # Columnas que verás en la lista (como en tu hoja)
    list_display = ('etiqueta_idioma','excursion','date', 'time', 'driver', 'vehicle', 'client', 'num_people', 'pickup_location_details', 'ver_mapa','language')
    list_filter = ('date', 'excursion','language', 'driver', 'provider',  'pickup_location_details')
    search_fields = ('client__name', 'pickup_address', 'pickup_location_details__name')
    
    def etiqueta_idioma(self, obj):
        # Definimos colores según el idioma para separar visualmente
        colores = {
            'FR': '#e3f2fd', # Azul clarito
            'EN': '#f1f8e9', # Verde clarito
            'ES': '#fff3e0', # Naranja clarito
            'IT': '#f3e5f5', # Morado clarito
        }
        color = colores.get(obj.language, '#ffffff')
        return format_html(
            '<span style="background-color: {}; padding: 5px; border-radius: 5px; font-weight: bold;">{}</span>',
            color,
            obj.get_language_display()
        )
    
    etiqueta_idioma.short_description = "Grupo/Idioma"
    
    # 2. Creamos la función del botón
    def ver_mapa(self, obj):
        if obj.pickup_location_details and obj.pickup_location_details.gps_coordinates:
            # Limpiamos posibles espacios en blanco
            coords = obj.pickup_location_details.gps_coordinates.strip()
            url = f"https://www.google.com/maps/search/?api=1&query={coords}"
            return format_html(
                '<a href="{}" target="_blank" style="'
                'background-color: #447e9b; color: white; padding: 3px 10px; '
                'border-radius: 4px; text-decoration: none; font-weight: bold;'
                '">📍 Ver Mapa</a>', 
                url
            )
        return "No GPS"
    
    ver_mapa.short_description = "Mapa" # Nombre de la columna
    
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
    
    def delete_model(self, request, obj):
        # 1. Pegamos el usuario al objeto
        obj._usuario_que_borra = request.user
        # 2. Forzamos el guardado del log manualmente ANTES de borrar el objeto
        # Importamos la función aquí para evitar errores
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        # 3. Ahora sí, borramos normal
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()
        
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Esto es solo un extra para que los placeholders ayuden al rellenar
        form.base_fields['num_people'].widget.attrs['placeholder'] = 'Ej: 4'
        return form

# Registramos el resto de modelos para poder meter datos
#admin.site.register(Provider)

@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ('name',)
    
    def delete_model(self, request, obj):
        obj._usuario_que_borra = request.user
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()

#admin.site.register(Guide)

@admin.register(Guide)
class GuideAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'languages')
    
    def delete_model(self, request, obj):
        obj._usuario_que_borra = request.user
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()




#admin.site.register(Vehicle)
#admin.site.register(Excursion)

@admin.register(Excursion)
class ExcursionAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_price')
    
    def delete_model(self, request, obj):
        obj._usuario_que_borra = request.user
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'model_name', 'capacity')
    search_fields = ('plate_number', 'model_name')

    def delete_model(self, request, obj):
        # 1. Pegamos el usuario al objeto
        obj._usuario_que_borra = request.user
        # 2. Forzamos el guardado del log manualmente ANTES de borrar el objeto
        # Importamos la función aquí para evitar errores
        from .signals import log_eliminacion
        log_eliminacion(sender=obj.__class__, instance=obj)
        # 3. Ahora sí, borramos normal
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj._usuario_que_borra = request.user
            from .signals import log_eliminacion
            log_eliminacion(sender=obj.__class__, instance=obj)
        queryset.delete()




@admin.register(HistorialEliminacion)
class HistorialEliminacionAdmin(admin.ModelAdmin):
    # Lo que verás en la tabla principal
    list_display = ('fecha_eliminacion', 'modelo', 'datos_resumen', 'usuario')
    list_filter = ('modelo', 'fecha_eliminacion', 'usuario')
    readonly_fields = ('fecha_eliminacion', 'modelo', 'usuario', 'ver_datos_detallados')
    exclude = ('datos_eliminados',) # Ocultamos el campo feo para mostrar el bonito

    def datos_resumen(self, obj):
        # Muestra un resumen rápido en la lista
        return obj.datos_legibles or "Sin detalles"
    datos_resumen.short_description = "Lo que se borró"

    def ver_datos_detallados(self, obj):
        # Convierte el JSON en un formato que se pueda leer bien en el admin
        datos = json.dumps(obj.datos_eliminados, indent=4, ensure_ascii=False)
        return mark_safe(f"<pre style='background: #f4f4f4; padding: 10px; border-radius: 5px;'>{datos}</pre>")
    
    ver_datos_detallados.short_description = "Datos técnicos completos"

    # Evitamos que alguien pueda editar un log (por seguridad)
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
from django.contrib import admin
from django.db.models import Sum
from .models import User, Provider, Client, Guide, Vehicle, Driver, Excursion, Booking, HistorialEliminacion
import json
from django.utils.safestring import mark_safe


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

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'language')
    search_fields = ('name', 'phone')
    
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
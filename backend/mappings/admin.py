from django.contrib import admin

from .models import PatientDoctorMapping


@admin.register(PatientDoctorMapping)
class PatientDoctorMappingAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'created_at']
    list_filter = ['doctor']
    search_fields = ['patient__name', 'doctor__name']

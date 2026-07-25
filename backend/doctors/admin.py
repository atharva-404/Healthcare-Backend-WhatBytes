from django.contrib import admin

from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'specialization', 'email', 'created_by', 'created_at']
    search_fields = ['name', 'specialization', 'email']
    list_filter = ['specialization']

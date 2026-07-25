from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from patients.models import Patient

from .models import PatientDoctorMapping
from .serializers import PatientDoctorMappingSerializer


class MappingListCreateView(generics.ListCreateAPIView):
    """
    POST /api/mappings/ - Assign a doctor to a patient.
    GET  /api/mappings/ - Retrieve all patient-doctor mappings.

    Scoped to mappings for patients created by the authenticated user,
    matching the ownership rules enforced on the Patient endpoints.
    """

    serializer_class = PatientDoctorMappingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PatientDoctorMapping.objects.filter(
            patient__created_by=self.request.user
        )


class MappingDetailView(APIView):
    """
    Handles the two distinct behaviours the spec assigns to the same
    `/api/mappings/<id>/` path, differentiated by HTTP method:

    GET    /api/mappings/<patient_id>/ - <id> is a *patient* id; returns
           all doctors assigned to that patient.
    DELETE /api/mappings/<id>/ - <id> is a *mapping* id; removes that
           specific patient-doctor assignment.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        patient = get_object_or_404(Patient, pk=id, created_by=request.user)
        mappings = PatientDoctorMapping.objects.filter(patient=patient)
        serializer = PatientDoctorMappingSerializer(mappings, many=True)
        return Response(serializer.data)

    def delete(self, request, id):
        mapping = get_object_or_404(
            PatientDoctorMapping,
            pk=id,
            patient__created_by=request.user,
        )
        mapping.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

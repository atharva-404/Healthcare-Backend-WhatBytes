from rest_framework import serializers

from doctors.models import Doctor
from doctors.serializers import DoctorSerializer
from patients.models import Patient
from patients.serializers import PatientSerializer

from .models import PatientDoctorMapping


class PatientDoctorMappingSerializer(serializers.ModelSerializer):
    """
    Accepts patient/doctor primary keys on write, and returns nested
    patient/doctor details on read.
    """

    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    patient_detail = PatientSerializer(source='patient', read_only=True)
    doctor_detail = DoctorSerializer(source='doctor', read_only=True)

    class Meta:
        model = PatientDoctorMapping
        fields = [
            'id',
            'patient',
            'doctor',
            'patient_detail',
            'doctor_detail',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_patient(self, patient):
        request = self.context.get('request')
        if request is not None and patient.created_by_id != request.user.id:
            raise serializers.ValidationError(
                'You can only assign doctors to patients you created.'
            )
        return patient

    def validate(self, attrs):
        patient = attrs.get('patient')
        doctor = attrs.get('doctor')
        if patient and doctor:
            qs = PatientDoctorMapping.objects.filter(patient=patient, doctor=doctor)
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    'This doctor is already assigned to this patient.'
                )
        return attrs

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of a user, safe to expose in API responses."""

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'created_at']
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user registration with name, email and password."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password']

    def validate_email(self, value):
        normalized = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return normalized

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
        )


class LoginSerializer(TokenObtainPairSerializer):
    """Extends the default JWT obtain-pair serializer to also expose user data.

    The username field is dynamically set to the model's USERNAME_FIELD
    (email), so clients authenticate with {"email": ..., "password": ...}.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

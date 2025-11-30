from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs["username"] = attrs.get("email")
        return super().validate(attrs)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'phone', 'city', 'state', 'pincode',
            'is_provider', 'is_towing'
        ]

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            phone=validated_data.get('phone'),
            city=validated_data.get('city'),
            state=validated_data.get('state'),
            pincode=validated_data.get('pincode'),
            is_provider=validated_data.get('is_provider', False),
            is_towing=validated_data.get('is_towing', False),
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("User is disabled")
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'phone', 'city', 'state', 'pincode',
            'is_provider', 'is_towing', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'created_at']

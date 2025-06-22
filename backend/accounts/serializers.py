from rest_framework import serializers
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    # profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model=User
        fields=all


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'full_name', 'password', 'role', 'phone_number', 'profile_image']

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'cashier'),
            phone_number=validated_data.get('phone_number'),
            # profile_image=validated_data.get('profile_image') # hold profile picture for now
        )

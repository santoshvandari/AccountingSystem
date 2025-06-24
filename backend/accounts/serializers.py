from rest_framework import serializers
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    # profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model=User
        exclude = ["id","password",'groups','user_permissions']

    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ProfileViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'full_name', 'phone_number', 'role','created_at', 'updated_at']
        read_only_fields = ['email', 'username', 'role']  # Make these fields read-only
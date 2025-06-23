from rest_framework import serializers
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    # profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model=User
        fields="__all__"

    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
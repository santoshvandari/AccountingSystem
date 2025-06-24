from rest_framework import serializers
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    # profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model=User
        exclude = ["id","password","is_superuser","is_staff","is_active","created_at","updated_at"]

    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
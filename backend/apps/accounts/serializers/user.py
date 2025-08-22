from rest_framework import serializers
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    # profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model=User
        exclude = ["id",'groups','user_permissions']
        extra_kwargs ={
            'password': {'write_only': True, },
            'role': {'default': 'cashier'}  # Default role is cashier
        }
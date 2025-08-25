from rest_framework import serializers
from apps.accounts.models import User

class ProfileViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'full_name', 'phone_number', 'role','created_at', 'updated_at']
        read_only_fields = ['email', 'username', 'role']  # Make these fields read-only
       
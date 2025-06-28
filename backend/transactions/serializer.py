from rest_framework import serializers
from transactions.models import Transaction
from django.contrib.auth import get_user_model

User= get_user_model()


class UserSerizlizer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["email","username","full_name","phone_number"]

class TransactionSerializer(serializers.ModelSerializer):
    user = UserSerizlizer()
    class Meta:
        model = Transaction
        fields="__all__"
        

class UpdateTransactionSerializer(serializers.Serializer):
    received_from = serializers.CharField(write_only=True)
    amount = serializers.DecimalField(write_only=True,max_digits=12, decimal_places=2)
    note = serializers.CharField(write_only=True)
    date = serializers.DateTimeField(write_only=True)
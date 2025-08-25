from rest_framework import serializers
from apps.transactions.models import Transaction
from django.contrib.auth import get_user_model
from datetime import datetime,timezone

User= get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["email","username","full_name","phone_number"]

class GetTransactionSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Transaction
        fields="__all__"
        
class CreateTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

class UpdateTransactionSerializer(serializers.Serializer):
    received_from = serializers.CharField(write_only=True)
    amount = serializers.DecimalField(write_only=True,max_digits=12, decimal_places=2)
    note = serializers.CharField(write_only=True, allow_blank=True, required=False)
    date = serializers.DateTimeField(write_only=True)

    def update(self, instance, validated_data):
        instance.received_from = validated_data.get('received_from', instance.received_from)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.note = validated_data.get('note', instance.note)
        instance.date = validated_data.get('date', instance.date)
        instance.save()
        return instance
    
class GetTransactionSummarySerializer(serializers.Serializer):
    start_date = serializers.DateField(write_only=True)
    end_date = serializers.DateField(write_only=True)

    def validate(self, attrs):
        current_date = datetime.now(timezone.utc).date()
        start_date = attrs['start_date']
        end_date = attrs['end_date']
        if start_date > current_date or end_date > current_date:
            raise serializers.ValidationError("Date cannot be in the future.")
        if start_date > end_date:
            raise serializers.ValidationError("Start date cannot be after end date.")
        attrs['start_date'] = start_date
        attrs['end_date'] = end_date
        return attrs
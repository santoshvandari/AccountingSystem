from rest_framework.serializers import ModelSerializer
from billing.models import Bill
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", 'username', 'email']
        read_only_fields = ['id', 'username', 'email']

class GetBillSerializer(ModelSerializer):
    issued_by = UserSerializer(read_only=True)
    class Meta:
        model = Bill
        fields = "__all__"

class PostBillSerializer(ModelSerializer):
    issued_by = UserSerializer(read_only=True)
    class Meta:
        model = Bill
        fields = '__all__'


class BillPDFSerializer(ModelSerializer):
    class Meta:
        model = Bill
        fields = ['id', 'amount', 'date', 'customer_name', 'description']
        read_only_fields = ['id', 'amount', 'date', 'customer_name', 'description']
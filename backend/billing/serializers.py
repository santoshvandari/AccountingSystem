from rest_framework.serializers import ModelSerializer
from billing.models import Bill


class BillSerializer(ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'


class BillPDFSerializer(ModelSerializer):
    class Meta:
        model = Bill
        fields = ['id', 'amount', 'date', 'customer_name', 'description']
        read_only_fields = ['id', 'amount', 'date', 'customer_name', 'description']
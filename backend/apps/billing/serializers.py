from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from billing.models import Bill, BillItem
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", 'username', 'email']
        read_only_fields = ['id', 'username', 'email']


class BillItemSerializer(ModelSerializer):
    class Meta:
        model = BillItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total', 'unit', 'notes']
        read_only_fields = ['id', 'total']

    def validate_unit_price(self, value):
        """Handle currency formatting and validate unit price"""
        if isinstance(value, str):
            # Remove currency formatting (commas, spaces)
            cleaned_value = value.replace(',', '').replace(' ', '').strip()
            try:
                return float(cleaned_value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("A valid number is required.")
        return value

    def validate_quantity(self, value):
        """Validate quantity"""
        if isinstance(value, str):
            try:
                return float(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError("A valid number is required.")
        return value

    def validate(self, data):
        """Calculate total automatically"""
        quantity = float(data.get('quantity', 1))
        unit_price = float(data.get('unit_price', 0))
        data['total'] = quantity * unit_price
        return data


class GetBillSerializer(ModelSerializer):
    issued_by = UserSerializer(read_only=True)
    bill_items = BillItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bill
        fields = [
            'id', 'bill_number', 'billed_to', 'customer_address', 'customer_phone', 
            'customer_email', 'subtotal', 'tax_percentage', 'tax_amount', 
            'discount_percentage', 'discount_amount', 'total_amount', 
            'payment_method', 'payment_details', 'note', 'issued_by', 
            'issued_at', 'created_at', 'updated_at', 'bill_items'
        ]


class PostBillSerializer(ModelSerializer):
    bill_items = BillItemSerializer(many=True)
    
    class Meta:
        model = Bill
        fields = [
            'bill_number', 'billed_to', 'customer_address', 'customer_phone', 
            'customer_email', 'tax_percentage', 'discount_percentage', 
            'payment_method', 'payment_details', 'note', 'issued_by', 
            'bill_items'
        ]
        read_only_fields = ['subtotal', 'tax_amount', 'discount_amount', 'total_amount']

    def create(self, validated_data):
        bill_items_data = validated_data.pop('bill_items')
        
        # Create the bill first
        bill = Bill.objects.create(**validated_data)
        
        # Create bill items after the bill is saved
        for item_data in bill_items_data:
            BillItem.objects.create(bill=bill, **item_data)
        
        # Refresh the bill to get updated totals
        bill.refresh_from_db()
        return bill

    def update(self, instance, validated_data):
        bill_items_data = validated_data.pop('bill_items', None)
        
        # Update bill fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Handle bill items update
        if bill_items_data is not None:
            # Delete existing items
            instance.bill_items.all().delete()
            
            # Create new items
            for item_data in bill_items_data:
                BillItem.objects.create(bill=instance, **item_data)
        
        # Save and recalculate totals
        instance.save()
        instance.refresh_from_db()
        return instance


class BillPDFSerializer(ModelSerializer):
    bill_items = BillItemSerializer(many=True, read_only=True)
    issued_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Bill
        fields = [
            'id', 'bill_number', 'billed_to', 'customer_address', 'customer_phone',
            'customer_email', 'subtotal', 'tax_percentage', 'tax_amount',
            'discount_percentage', 'discount_amount', 'total_amount',
            'payment_method', 'payment_details', 'note', 'issued_by',
            'issued_at', 'bill_items'
        ]
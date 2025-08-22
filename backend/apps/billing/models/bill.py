# Create your models here.
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from billing.utils import get_deleted_user

User = get_user_model()


class Bill(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('digital_wallet', 'Digital Wallet'),
        ('credit_card', 'Credit Card'),
        ('other', 'Other'),
    ]

    bill_number = models.CharField(max_length=20, unique=True)
    
    # Customer Information
    billed_to = models.CharField(max_length=100)  # Customer name
    customer_address = models.TextField(blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    
    # Bill Details
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Tax percentage
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Payment Information
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    payment_details = models.TextField(blank=True, null=True)  # Additional payment info
    
    # General notes
    note = models.TextField(blank=True, null=True)
    
    # Meta information
    issued_by = models.ForeignKey(User, on_delete=models.SET(get_deleted_user), related_name="bills_issued")
    issued_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-issued_at']

    def calculate_totals(self):
        """Calculate subtotal, tax, discount and total from bill items"""
        items = self.bill_items.all()
        self.subtotal = sum(item.total for item in items)
        
        # Calculate discount
        if self.discount_percentage > 0:
            self.discount_amount = (self.subtotal * self.discount_percentage) / 100
        else:
            self.discount_amount = 0
        
        # Calculate tax on discounted amount
        taxable_amount = self.subtotal - self.discount_amount
        if self.tax_percentage > 0:
            self.tax_amount = (taxable_amount * self.tax_percentage) / 100
        else:
            self.tax_amount = 0
        
        # Calculate total
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount
        
    def save(self, *args, **kwargs):
        # Only calculate totals if the bill has been saved (has pk) and has items
        if self.pk:
            self.calculate_totals()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bill #{self.bill_number} for Rs.{self.total_amount} to {self.billed_to}"


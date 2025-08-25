from django.db import models
from .bill import Bill

class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='bill_items')
    description = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Optional fields for more details
    unit = models.CharField(max_length=20, blank=True, null=True)  # e.g., "piece", "hour", "kg"
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']
    
    def save(self, *args, **kwargs):
        # Calculate total automatically
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        
        # Update bill totals if bill exists and is saved
        if self.bill_id and self.bill.pk:
            from django.db.models import Sum
            # Use update to avoid recursion
            Bill.objects.filter(pk=self.bill.pk).update(
                subtotal=self.bill.bill_items.aggregate(
                    total=Sum('total')
                )['total'] or 0
            )
            # Recalculate and save the bill
            self.bill.refresh_from_db()
            self.bill.calculate_totals()
            Bill.objects.filter(pk=self.bill.pk).update(
                subtotal=self.bill.subtotal,
                tax_amount=self.bill.tax_amount,
                discount_amount=self.bill.discount_amount,
                total_amount=self.bill.total_amount
            )
    
    def __str__(self):
        return f"{self.description} - {self.quantity} x Rs.{self.unit_price}"

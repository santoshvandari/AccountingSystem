# Create your models here.
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

# Function to get or create a deleted user  
def get_deleted_user():
    return User.objects.get_or_create(
        email="deleted@example.com",
        defaults={
            "username": "deleted_user",
            "full_name": "Deleted User",
            "role": "cashier",  # or any default role
            "is_active": False,
        }
    )[0]

class Bill(models.Model):
    bill_number = models.CharField(max_length=20, unique=True)
    billed_to = models.CharField(max_length=100)  # Customer name
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    issued_by = models.ForeignKey(User, on_delete=models.SET(get_deleted_user), related_name="bills_issued")
    issued_at = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f"Bill #{self.bill_number} for Rs.{self.amount} to {self.billed_to}"

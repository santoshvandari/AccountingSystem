from django.db import models
from django.utils import timezone
from transactions.utils import get_deleted_user
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET(get_deleted_user),related_name="transactions")
    received_from = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    date = models.DateField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Rs.{self.amount} from {self.received_from} by {self.user.full_name}"
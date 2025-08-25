from django.contrib import admin
from .models import Transaction

# Register your models here.
class TransactionAdminView(admin.ModelAdmin):
    search_fields = ('received_from',)
    list_filter = ('date', 'user')


admin.site.register(Transaction, TransactionAdminView)

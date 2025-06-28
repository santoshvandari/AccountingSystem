from django.contrib import admin
from transactions.models import Transaction

# Register your models here.
class TransactionView(admin.ModelAdmin):
    search_fields = ('received_from')
    list_filter = ('date', 'user')


admin.site.register(Transaction)

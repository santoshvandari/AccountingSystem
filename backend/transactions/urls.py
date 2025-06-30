from django.urls import path
from transactions import views



urlpatterns = [
    path("",views.GetTransaction.as_view(),name="GetTransactions"),
    path("create/",views.CreateTransaction.as_view(),name="CreateTransaction"),
    path("update/<int:transaction_id>/",views.UpdateTransaction.as_view(),name="UpdateTransaction"),
    path("details/<int:transaction_id>/", views.GetTransactionDetail.as_view(), name="GetTransactionDetail"),
    path("delete/<int:transaction_id>/", views.DeleteTransaction.as_view(), name="DeleteTransaction"),
    path("summary/", views.GetTransactionSummary.as_view(), name="GetTransactionSummary"),

]



# Suggested Endpoints for transactions App
# Method	Endpoint	Description
# POST	/api/transactions/	Create a new transaction
# GET	/api/transactions/	List all transactions (filterable)
# GET	/api/transactions/<id>/	Get details of a specific transaction
# PUT	/api/transactions/<id>/	Update a transaction
# DELETE	/api/transactions/<id>/	Delete a transaction
# GET	/api/transactions/summary/	Daily/weekly/monthly income/expense summary (optional)
# GET	/api/transactions/payment-methods/	List available payment methods (dropdown)
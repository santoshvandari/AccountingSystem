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



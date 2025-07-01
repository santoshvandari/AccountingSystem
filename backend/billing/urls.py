from django.urls import path
from billing import views

urlpatterns = [
    path("", views.BillListCreateView.as_view(), name="bill-list-create"),
    path("<int:id>/", views.BillDetailView.as_view(), name="bill-detail"),
    path("<int:id>/update/", views.BillUpdateView.as_view(), name="bill-update"),
    path("<int:id>/pdf/", views.BillPDFView.as_view(), name="bill-pdf"),
]


# Method	Endpoint	Description
# POST	/api/bills/	Create a new bill
# GET	/api/bills/	List all bills
# GET	/api/bills/<id>/	Get details of a specific bill
# PUT	/api/bills/<id>/	Update a bill
# DELETE	/api/bills/<id>/	Delete a bill
# GET	/api/bills/<id>/pdf/	Generate/download PDF of the bill

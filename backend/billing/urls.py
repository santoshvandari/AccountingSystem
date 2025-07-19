from django.urls import path
from billing import views

urlpatterns = [
    path("", views.BillListCreateView.as_view(), name="bill-list-create"),
    path("<int:id>/", views.BillDetailView.as_view(), name="bill-detail"),
    path("<int:id>/update/", views.BillUpdateView.as_view(), name="bill-update"),
    # PDF generation is now handled in frontend
    # path("<int:id>/pdf/", views.BillPDFView.as_view(), name="bill-pdf"),
]

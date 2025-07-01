from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from billing.models import Bill
from billing.serializers import BillSerializer, BillPDFSerializer
from rest_framework import permissions

# Create your views here.
class BillListCreateView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self, request):
        bills = Bill.objects.all()
        serializer = BillSerializer(bills, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class BillDetailView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self, request, id):
        try:
            bill = Bill.objects.get(id=id)
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = BillSerializer(bill)
class BillUpdateView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def put(self, request, id):
        try:
            bill = Bill.objects.get(id=id)
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = BillSerializer(bill, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    
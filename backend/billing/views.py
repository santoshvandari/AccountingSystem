from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from billing.models import Bill
from billing.serializers import BillPDFSerializer, GetBillSerializer, PostBillSerializer
from rest_framework import permissions
from core.permissions import IsSuperUserOnly

# Create your views here.
class BillListCreateView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self, request):
        bills = Bill.objects.all()
        serializer = GetBillSerializer(bills, many=True)
        return Response(serializer.data)

    def post(self, request):
        # TODO: auto Generate the unique bill number 
        user_id = request.user.id
        request.data['issued_by'] = user_id  # Set the issued_by field to the
        serializer = PostBillSerializer(data=request.data)
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
        serializer = GetBillSerializer(bill)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BillUpdateView(APIView):
    permission_classes=[IsSuperUserOnly]  # Only superusers can update bills
    def put(self, request, id):
        try:
            bill = Bill.objects.get(id=id)
        except Bill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = PostBillSerializer(bill, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class BillDeleteView(APIView):
    permission_classes=[IsSuperUserOnly]  # Only superusers can delete bills
    def delete(self, request, id):
        """
        Delete a bill by its ID. Only accessible by superusers.
        """
        try:
            bill = Bill.objects.get(id=id)
        except Bill.DoesNotExist:
            return Response({"error": "Bill not found"}, status=status.HTTP_404_NOT_FOUND)

        bill.delete()
        return Response({"message": "Bill deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# PDF generation is now handled in frontend
# class BillPDFView(APIView):
#     permission_classes=[permissions.IsAuthenticated]
#     def get(self, request, id):
#         try:
#             bill = Bill.objects.get(id=id)
#         except Bill.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         
#         serializer = BillPDFSerializer(bill)
#         return Response(serializer.data, status=status.HTTP_200_OK)
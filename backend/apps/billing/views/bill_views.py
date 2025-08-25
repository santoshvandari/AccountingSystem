from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from billing.models import Bill
from billing.serializers import GetBillSerializer, PostBillSerializer
from rest_framework import permissions
from django.db import transaction
from common.permissions import BillingPermissions, CashierReadOnlyAfterCreation, IsSuperUserOnly
from billing.utils import generate_bill_number

# Create your views here.
class BillListCreateView(APIView):
    permission_classes = [BillingPermissions]
    
    def get(self, request):
        bills = Bill.objects.all().prefetch_related('bill_items', 'issued_by')
        serializer = GetBillSerializer(bills, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            # Make a copy of the request data to avoid modifying the original
            data = request.data.copy()
            
            # Generate unique bill number if not provided or empty
            if not data.get('bill_number') or not data.get('bill_number').strip():
                data['bill_number'] = generate_bill_number()
            
            # Set the issued_by field to the current user
            data['issued_by'] = request.user.id
            
            with transaction.atomic():
                serializer = PostBillSerializer(data=data)
                if serializer.is_valid():
                    bill = serializer.save()
                    # Return the created bill with all details
                    response_serializer = GetBillSerializer(bill)
                    return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response({
                        "error": "Validation failed",
                        "details": serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            return Response(
                {"error": f"Failed to create bill: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

class BillDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, id):
        try:
            bill = Bill.objects.prefetch_related('bill_items', 'issued_by').get(id=id)
            serializer = GetBillSerializer(bill)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Bill.DoesNotExist:
            return Response(
                {"error": "Bill not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve bill: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BillUpdateView(APIView):
    permission_classes = [CashierReadOnlyAfterCreation]
    
    def put(self, request, id):
        try:
            # Check permissions explicitly for better error messages
            if request.user.role == 'cashier':
                return Response({
                    "error": "Cashiers cannot edit bills after creation. Please contact a manager."
                }, status=status.HTTP_403_FORBIDDEN)
            
            bill = Bill.objects.get(id=id)
            
            with transaction.atomic():
                serializer = PostBillSerializer(bill, data=request.data, partial=True)
                if serializer.is_valid():
                    updated_bill = serializer.save()
                    # Return the updated bill with all details
                    response_serializer = GetBillSerializer(updated_bill)
                    return Response(response_serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
        except Bill.DoesNotExist:
            return Response(
                {"error": "Bill not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to update bill: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BillDeleteView(APIView):
    permission_classes = [IsSuperUserOnly]
    
    def delete(self, request, id):
        try:
            # Additional check for better error message
            if not request.user.is_superuser:
                return Response({
                    "error": "Only superusers can delete bills. Please contact a system administrator."
                }, status=status.HTTP_403_FORBIDDEN)
            
            bill = Bill.objects.get(id=id)
            bill_number = bill.bill_number
            bill.delete()
            return Response(
                {"message": f"Bill {bill_number} deleted successfully"}, 
                status=status.HTTP_200_OK
            )
        except Bill.DoesNotExist:
            return Response(
                {"error": "Bill not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to delete bill: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
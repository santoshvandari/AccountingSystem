from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from billing.models import Bill, BillItem
from billing.serializers import BillPDFSerializer, GetBillSerializer, PostBillSerializer
from rest_framework import permissions
from django.db import transaction
import uuid

# Create your views here.
class BillListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        bills = Bill.objects.all().prefetch_related('bill_items', 'issued_by')
        serializer = GetBillSerializer(bills, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            # Generate unique bill number if not provided or empty
            if not request.data.get('bill_number') or not request.data.get('bill_number').strip():
                request.data['bill_number'] = self.generate_bill_number()
            
            # Set the issued_by field to the current user
            request.data['issued_by'] = request.user.id
            
            with transaction.atomic():
                serializer = PostBillSerializer(data=request.data)
                if serializer.is_valid():
                    bill = serializer.save()
                    # Return the created bill with all details
                    response_serializer = GetBillSerializer(bill)
                    return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            return Response(
                {"error": f"Failed to create bill: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def generate_bill_number(self):
        """Generate a unique bill number"""
        import uuid
        from datetime import datetime
        
        # Try to make a unique number with date + random
        date_part = datetime.now().strftime("%y%m%d")
        random_part = uuid.uuid4().hex[:4].upper()
        bill_number = f"INV-{date_part}{random_part}"
        
        # Check if this number already exists, if so generate a new one
        counter = 1
        original_bill_number = bill_number
        while Bill.objects.filter(bill_number=bill_number).exists():
            bill_number = f"{original_bill_number}-{counter}"
            counter += 1
            # Safety break to avoid infinite loop
            if counter > 100:
                bill_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
                break
                
        return bill_number



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
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, id):
        try:
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
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, id):
        try:
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
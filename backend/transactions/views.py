from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from transactions.serializer import TransactionSerializer,UpdateTransactionSerializer
from transactions.models import Transaction

from django.contrib.auth import get_user_model


import logging


User = get_user_model()

# Configure logging
logger = logging.getLogger(__name__)



# Create your views here.
class GetTransaction(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self,request):
        transactions = Transaction.objects.all()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)



class CreateTransaction(APIView):
    permission_classes= [permissions.IsAuthenticated]
    def post(self, request):
        request.data["user"]=1
        serializer = TransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Transaction Created Successfully"},status=status.HTTP_201_CREATED)
    

class UpdateTransaction(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        transaction_id = request.data.pop("id", None)
        if not transaction_id:
            return Response({"error": "Transaction ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UpdateTransactionSerializer(transaction, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Transaction Updated Successfully"}, status=status.HTTP_200_OK)
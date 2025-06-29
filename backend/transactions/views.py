from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from transactions.serializer import GetTransactionSummarySerializer, TransactionSerializer,UpdateTransactionSerializer
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

    def put(self, request, transaction_id=None):
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
    
class GetTransactionDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, transaction_id=None):
        if not transaction_id:
            return Response({"error": "Transaction ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class GetTransactionSummary(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get a summary of all transactions including total income, total expense, and balance of the Daily, Weekly and Monthly. 
        """
        serializer = GetTransactionSummarySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')

        transactions = Transaction.objects.filter(date__range=[start_date, end_date])
        
        if duration == 'daily':
            transactions = transactions.filter(date=start_date)
        elif duration == 'weekly':
            transactions = transactions.filter(date__week=start_date.isocalendar()[1])
        elif duration == 'monthly':
            transactions = transactions.filter(date__month=start_date.month)

        total_income = sum(t.amount for t in transactions if t.amount > 0)
        total_expense = sum(t.amount for t in transactions if t.amount < 0)
        balance = total_income + total_expense

        summary = {
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance
        }

        return Response(summary, status=status.HTTP_200_OK)
        
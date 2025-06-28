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
    permission_classes=[permissions.IsAuthenticated]
    def put(self,request):
        serializer = UpdateTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Transacton Details Updated"},status=status.HTTP_200_OK)
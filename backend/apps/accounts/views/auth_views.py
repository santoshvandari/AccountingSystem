from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from apps.accounts.serializers import UserSerializer,LoginSerializer
from common.permissions import CanCreateUsers

from django.contrib.auth import authenticate
from apps.accounts.utils import get_tokens_for_user
from django.contrib.auth import get_user_model

import logging


# Get the User Model
User = get_user_model()

logger = logging.getLogger(__name__)


# Register a new user
class RegisterView(APIView):
    """
    Handles user registration and updates.
    """
    permission_classes = [CanCreateUsers] # Managers can create cashiers, admins can create any
    def post(self, request):
        """
        Registers a new user.
        """
        # Additional validation for managers creating users
        if request.user.role == 'manager':
            role = request.data.get('role', '').lower()
            if role != 'cashier':
                return Response(
                    {"error": "Managers can only create cashier accounts"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                User.objects.create_user(**serializer.validated_data)
                return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"User registration error: {e}")
                return Response({"error":"User Registration Failed"}, status=status.HTTP_400_BAD_REQUEST)


# User Login View
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Logs in a user and returns a token.
        """
        try:
            serializer = LoginSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')
            
            user = authenticate(request, username=email, password=password)

            if user is not None:
                if user.is_active:
                    token = get_tokens_for_user(user)
                    reponse = {
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role,
                    }
                    reponse.update(token)
                    return Response(reponse, status=status.HTTP_200_OK)

                return Response({"error": "User is inactive"}, status=status.HTTP_403_FORBIDDEN)
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response({"error": "An error occurred during login"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
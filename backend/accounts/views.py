from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from accounts.serializers import UserSerializer,LoginSerializer,ProfileViewSerializer

from django.contrib.auth import authenticate
from accounts.utils import get_tokens_for_user
from django.contrib.auth import get_user_model


import logging


User = get_user_model()

# Configure logging
logger = logging.getLogger(__name__)

# Create your views here.
class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]   
    # Get the Individual user information  
    def get(self, request):
        """
        Returns the current user's information.
        """
        user = User.objects.all()
        serializer = UserSerializer(user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Register a new user
    permission_classes = [permissions.IsAdminUser] # Only admin can register new users
    def post(self, request):
        """
        Registers a new user.
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(**serializer.data)
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        """
        Updates the current user's information.
        """
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


        
    def delete(self, request):
        """
        Deletes the current user.
        """
        user_email = request.data.get('email')
        if not user_email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=user_email)
            user.delete()
            return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
# class 

# User Login View
class LogenView(APIView):
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
        

# User Profile View
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Returns the profile of the authenticated user.
        """
        user = request.user
        serializer = ProfileViewSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Updates the profile of the authenticated user.
        """
        user = request.user
        serializer = ProfileViewSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
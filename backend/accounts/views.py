from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from accounts.serializers import ChangePasswordSerializer, UserSerializer,LoginSerializer,ProfileViewSerializer
from core.permissions import IsSuperUserOnly, CanManageUsers

from django.contrib.auth import authenticate
from accounts.utils import get_tokens_for_user
from django.contrib.auth import get_user_model
from accounts.manager import UserManager


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
class RegisterView(APIView):
    """
    Handles user registration and updates.
    """
    permission_classes = [CanManageUsers] # Role-based user management permissions
    def post(self, request):
        """
        Registers a new user.
        """
        # Get the role of the user being created
        target_role = request.data.get('role', '').lower()
        
        # Define role hierarchy: admin > manager > cashier
        role_hierarchy = {
            'admin': 3,
            'manager': 2,
            'cashier': 1
        }
        
        user_level = role_hierarchy.get(request.user.role, 0)
        target_level = role_hierarchy.get(target_role, 0)
        
        # Managers can only create users below their level
        if request.user.role == 'manager' and target_level >= user_level:
            return Response(
                {"error": "Managers can only create cashier accounts or users below their level"}, 
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

# Update the user information
class UpdateUserView(APIView):
    permission_classes = [CanManageUsers]  # Role-based user management permissions   
    def put(self, request):
        """
        Updates user information based on role hierarchy.
        """
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            
            # Check if current user can manage the target user
            permission = CanManageUsers()
            if not permission.has_object_permission(request, self, user):
                return Response(
                    {"error": "You don't have permission to update this user"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # If updating role, check hierarchy
            if 'role' in request.data:
                target_role = request.data.get('role', '').lower()
                role_hierarchy = {
                    'admin': 3,
                    'manager': 2,
                    'cashier': 1
                }
                
                user_level = role_hierarchy.get(request.user.role, 0)
                target_level = role_hierarchy.get(target_role, 0)
                
                # Managers can only assign roles below their level
                if request.user.role == 'manager' and target_level >= user_level:
                    return Response(
                        {"error": "Managers can only assign roles below their level"}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# Delete the user account
class DeleteUserView(APIView):
    permission_classes = [IsSuperUserOnly]  # Only superusers can delete users       
    def delete(self, request):
        """
        Deletes a user. Only accessible by superusers.
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

# Update Profile View
class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    """
    Handles updating the profile of the authenticated user.
    """
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
    

# Change Password View
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Changes the password of the authenticated user.
        """
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
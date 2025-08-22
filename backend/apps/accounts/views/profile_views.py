from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status
from accounts.serializers import ProfileViewSerializer

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
    


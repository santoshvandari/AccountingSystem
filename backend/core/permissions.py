from rest_framework.permissions import BasePermission


class IsSuperUserOnly(BasePermission):
    """
    Permission class that only allows superusers to access the view.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsManagerOrAbove(BasePermission):
    """
    Permission class that allows managers and admins to access the view.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'manager']
        )


class CanManageUsers(BasePermission):
    """
    Permission class for user management based on role hierarchy.
    - Admins/Superusers can manage all users
    - Managers can only manage cashiers and other users below their level
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Superusers and admins can manage all users
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        
        # Managers can manage users (will be further restricted in has_object_permission)
        if request.user.role == 'manager':
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission to restrict managers to only manage lower-level users.
        """
        if not request.user.is_authenticated:
            return False
        
        # Superusers and admins can manage all users
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        
        # Managers can only manage cashiers and users below their level
        if request.user.role == 'manager':
            # Define role hierarchy: admin > manager > cashier
            role_hierarchy = {
                'admin': 3,
                'manager': 2,
                'cashier': 1
            }
            
            user_level = role_hierarchy.get(request.user.role, 0)
            target_level = role_hierarchy.get(obj.role, 0)
            
            # Manager can only manage users with lower hierarchy level
            return user_level > target_level
        
        return False
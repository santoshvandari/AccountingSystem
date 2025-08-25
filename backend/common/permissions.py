from rest_framework import permissions


class IsSuperUserOnly(permissions.BasePermission):
    """
    Custom permission to only allow superusers to perform certain actions.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsManagerOrAbove(permissions.BasePermission):
    """
    Custom permission to allow managers and admins to perform certain actions.
    """
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role in ['admin', 'manager'])


class CanCreateUsers(permissions.BasePermission):
    """
    Custom permission to allow managers to create cashier users.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Managers can create cashier users
        if request.user.role == 'manager':
            # Check if they're trying to create a cashier role
            role = request.data.get('role', '').lower()
            return role == 'cashier'
        
        # Admins can create any users
        return request.user.role == 'admin'


class BillingPermissions(permissions.BasePermission):
    """
    Custom permission for billing operations:
    - Superuser: Can delete bills
    - Manager: Can create, read, update bills
    - Cashier: Can create, read bills (no update/delete)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can read
        if request.method in ['GET']:
            return True
        
        # Superuser can do everything
        if request.user.is_superuser:
            return True
        
        # Only superuser can delete
        if request.method == 'DELETE':
            return request.user.is_superuser
        
        # Manager and above can create/update
        if request.method in ['POST', 'PUT', 'PATCH']:
            return request.user.role in ['admin', 'manager']
        
        return False


class TransactionPermissions(permissions.BasePermission):
    """
    Custom permission for transaction operations:
    - Superuser: Can delete transactions
    - Manager: Can create, read, update transactions
    - Cashier: Can create, read transactions (no update/delete)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All authenticated users can read
        if request.method in ['GET']:
            return True
        
        # Superuser can do everything
        if request.user.is_superuser:
            return True
        
        # Only superuser can delete
        if request.method == 'DELETE':
            return request.user.is_superuser
        
        # Manager and above can create/update
        if request.method in ['POST', 'PUT', 'PATCH']:
            return request.user.role in ['admin', 'manager']
        
        return False


class CashierReadOnlyAfterCreation(permissions.BasePermission):
    """
    Cashiers can create but cannot edit after creation.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All can read
        if request.method == 'GET':
            return True
        
        # Superuser and managers can do everything
        if request.user.role in ['admin', 'manager'] or request.user.is_superuser:
            return True
        
        # Cashiers can only create (POST), not update/delete
        if request.user.role == 'cashier':
            return request.method == 'POST'
        
        return False

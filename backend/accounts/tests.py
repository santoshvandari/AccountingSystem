from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from billing.models import Bill
from transactions.models import Transaction

User = get_user_model()


class PermissionTestCase(APITestCase):
    def setUp(self):
        """Set up test users with different roles."""
        # Create a superuser
        self.superuser = User.objects.create_user(
            email="super@test.com",
            username="superuser",
            full_name="Super User",
            password="testpass123",
            role="admin",
            is_superuser=True
        )
        
        # Create an admin user
        self.admin = User.objects.create_user(
            email="admin@test.com",
            username="admin",
            full_name="Admin User",
            password="testpass123",
            role="admin"
        )
        
        # Create a manager user
        self.manager = User.objects.create_user(
            email="manager@test.com",
            username="manager",
            full_name="Manager User",
            password="testpass123",
            role="manager"
        )
        
        # Create a cashier user
        self.cashier = User.objects.create_user(
            email="cashier@test.com",
            username="cashier",
            full_name="Cashier User",
            password="testpass123",
            role="cashier"
        )
        
        # Create test data
        self.bill = Bill.objects.create(
            bill_number="TEST001",
            billed_to="Test Customer",
            amount=100.00,
            issued_by=self.admin
        )
        
        self.transaction = Transaction.objects.create(
            received_from="Test Customer",
            amount=50.00,
            note="Test description",
            user=self.admin
        )

    def get_token_for_user(self, user):
        """Generate JWT token for user."""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def authenticate_user(self, user):
        """Authenticate a user for API requests."""
        token = self.get_token_for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')


class BillPermissionTestCase(PermissionTestCase):
    def test_superuser_can_update_bill(self):
        """Test that superuser can update bills."""
        self.authenticate_user(self.superuser)
        
        response = self.client.put(
            f'/api/bills/{self.bill.id}/update/',
            {'amount': 150.00}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_cannot_update_bill(self):
        """Test that regular admin cannot update bills (only superuser can)."""
        self.authenticate_user(self.admin)
        
        response = self.client.put(
            f'/api/bills/{self.bill.id}/update/',
            {'amount': 150.00}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_cannot_update_bill(self):
        """Test that manager cannot update bills."""
        self.authenticate_user(self.manager)
        
        response = self.client.put(
            f'/api/bills/{self.bill.id}/update/',
            {'amount': 150.00}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cashier_cannot_update_bill(self):
        """Test that cashier cannot update bills."""
        self.authenticate_user(self.cashier)
        
        response = self.client.put(
            f'/api/bills/{self.bill.id}/update/',
            {'amount': 150.00}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superuser_can_delete_bill(self):
        """Test that superuser can delete bills."""
        self.authenticate_user(self.superuser)
        
        response = self.client.delete(f'/api/bills/{self.bill.id}/delete/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Bill.objects.filter(id=self.bill.id).exists())

    def test_admin_cannot_delete_bill(self):
        """Test that regular admin cannot delete bills."""
        self.authenticate_user(self.admin)
        
        response = self.client.delete(f'/api/bills/{self.bill.id}/delete/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Bill.objects.filter(id=self.bill.id).exists())

    def test_manager_cannot_delete_bill(self):
        """Test that manager cannot delete bills."""
        self.authenticate_user(self.manager)
        
        response = self.client.delete(f'/api/bills/{self.bill.id}/delete/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Bill.objects.filter(id=self.bill.id).exists())


class TransactionPermissionTestCase(PermissionTestCase):
    def test_superuser_can_update_transaction(self):
        """Test that superuser can update transactions."""
        self.authenticate_user(self.superuser)
        
        response = self.client.put(
            f'/api/transactions/update/{self.transaction.id}/',
            {'amount': 75.00}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_cannot_update_transaction(self):
        """Test that regular admin cannot update transactions."""
        self.authenticate_user(self.admin)
        
        response = self.client.put(
            f'/api/transactions/update/{self.transaction.id}/',
            {'amount': 75.00}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superuser_can_delete_transaction(self):
        """Test that superuser can delete transactions."""
        self.authenticate_user(self.superuser)
        
        response = self.client.delete(f'/api/transactions/delete/{self.transaction.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transaction.objects.filter(id=self.transaction.id).exists())

    def test_admin_cannot_delete_transaction(self):
        """Test that regular admin cannot delete transactions."""
        self.authenticate_user(self.admin)
        
        response = self.client.delete(f'/api/transactions/delete/{self.transaction.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Transaction.objects.filter(id=self.transaction.id).exists())


class UserManagementPermissionTestCase(PermissionTestCase):
    def test_superuser_can_delete_user(self):
        """Test that superuser can delete users."""
        self.authenticate_user(self.superuser)
        
        response = self.client.delete(
            '/api/accounts/delete-user/',
            {'email': self.cashier.email}
        )
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(email=self.cashier.email).exists())

    def test_admin_cannot_delete_user(self):
        """Test that regular admin cannot delete users."""
        self.authenticate_user(self.admin)
        
        response = self.client.delete(
            '/api/accounts/delete-user/',
            {'email': self.cashier.email}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(User.objects.filter(email=self.cashier.email).exists())

    def test_manager_can_register_cashier(self):
        """Test that manager can register cashier users."""
        self.authenticate_user(self.manager)
        
        response = self.client.post('/api/accounts/register/', {
            'email': 'newcashier@test.com',
            'username': 'newcashier',
            'full_name': 'New Cashier',
            'password': 'testpass123',
            'role': 'cashier'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_manager_cannot_register_admin(self):
        """Test that manager cannot register admin users."""
        self.authenticate_user(self.manager)
        
        response = self.client.post('/api/accounts/register/', {
            'email': 'newadmin@test.com',
            'username': 'newadmin',
            'full_name': 'New Admin',
            'password': 'testpass123',
            'role': 'admin'
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_cannot_register_manager(self):
        """Test that manager cannot register other manager users."""
        self.authenticate_user(self.manager)
        
        response = self.client.post('/api/accounts/register/', {
            'email': 'newmanager@test.com',
            'username': 'newmanager',
            'full_name': 'New Manager',
            'password': 'testpass123',
            'role': 'manager'
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

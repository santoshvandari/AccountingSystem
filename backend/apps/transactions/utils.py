from django.contrib.auth import get_user_model

User = get_user_model()

# Function to get or create a deleted user  
def get_deleted_user():
    return User.objects.get_or_create(
        email="deleted@example.com",
        defaults={
            "username": "deleted_user",
            "full_name": "Deleted User",
            "role": "cashier",  # or any default role
            "is_active": False,
        }
    )[0]
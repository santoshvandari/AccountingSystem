from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role='cashier', **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        extra_fields.setdefault("is_staff",True)
        extra_fields.setdefault("is_active",True)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, role="admin", **extra_fields):
        extra_fields.setdefault("is_superuser",True)
        return self.create_user(email,password,role,**extra_fields)

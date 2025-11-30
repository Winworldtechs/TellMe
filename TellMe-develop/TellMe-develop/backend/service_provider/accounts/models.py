import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        if not username:
            raise ValueError("The Username field is required")

        email = self.normalize_email(email)
        # ⚠️ (सुधार) user object बनाते समय password को पास न करें।
        # extra_fields में से password हटा दिया गया है
        user = self.model(email=email, username=username, **extra_fields) 
        
        # 💡 set_password() का उपयोग करके password को hash करें
        if password:
            user.set_password(password)
        
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password, **extra_fields):
        # 💡 (सुधार) Redundancy कम की गई है। defaults सेट करें।
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        
        # Validation checks
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # create_user को कॉल करें
        return self.create_user(email, username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    # यह मॉडल सही है
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    is_provider = models.BooleanField(default=False)
    is_towing = models.BooleanField(default=False)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def __str__(self):
        return self.email
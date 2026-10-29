
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import (
    RegisterView,
    ForgotPasswordView,
    ResetPasswordView,
    EmployeeListCreateView,
    EmployeeDetailView,
)

urlpatterns = [
    # User Authentication
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login",
    ),
    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),
    path(
        "reset-password/<uidb64>/<token>/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),

    # Employee CRUD Operations
    path(
        "employees/",
        EmployeeListCreateView.as_view(),
        name="employee-list-create",
    ),
    path(
        "employees/<int:pk>/",
        EmployeeDetailView.as_view(),
        name="employee-detail",
    ),
]

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from accounts import views


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("user/", views.UserView.as_view(), name="register"),
    path("logout/", views.LogoutView.as_view(), name="logout"),





    # path("profile/", views.ProfileView.as_view(), name="profile"),
    # path("change-password/", views.ChangePasswordView.as_view(), name="change_password"),
    # path("reset-password/", views.ResetPasswordView.as_view(), name="reset_password"),
    # path("verify-email/", views.VerifyEmailView.as_view(), name="verify_email"),
    # path("resend-verification-email/", views.ResendVerificationEmailView.as_view(), name="resend_verification_email"),
    # path("update-profile/", views.UpdateProfileView.as_view(), name="update_profile"),
    # path("delete-account/", views.DeleteAccountView.as_view(), name="delete_account"),
    # path("list-users/", views.ListUsersView.as_view(), name="list_users"),
    # path("user-detail/<int:pk>/", views.UserDetailView.as_view(), name="user_detail"),
    # path("change-role/<int:pk>/", views.ChangeRoleView.as_view(), name="change_role"),
    # path("send-reset-password-email/", views.SendResetPasswordEmailView.as_view(), name="send_reset_password_email"),
    # path("verify-reset-password-token/", views.VerifyResetPasswordTokenView.as_view(), name="verify_reset_password_token"),
    # path("reset-password-confirm/", views.ResetPasswordConfirmView.as_view(), name="reset_password_confirm"),
    # path("list-roles/", views.ListRolesView.as_view(), name="list_roles"),
    # path("role-detail/<int:pk>/", views.RoleDetailView.as_view(), name="role_detail"),
    # path("create-role/", views.CreateRoleView.as_view(), name="create_role"),
    # path("update-role/<int:pk>/", views.UpdateRoleView.as_view(), name="update_role"),
    # path("delete-role/<int:pk>/", views.DeleteRoleView.as_view(), name="delete_role"),
    # path("assign-role/<int:user_id>/<int:role_id>/", views.AssignRoleView.as_view(), name="assign_role"),
    # path("remove-role/<int:user_id>/<int:role_id>/", views.RemoveRoleView.as_view(), name="remove_role"),
    # path("list-permissions/", views.ListPermissionsView.as_view(), name="list_permissions"),
    # path("permission-detail/<int:pk>/", views.PermissionDetailView.as_view(), name="permission_detail"),
    # path("create-permission/", views.CreatePermissionView.as_view(), name="create_permission"),
    # path("update-permission/<int:pk>/", views.UpdatePermissionView.as_view(), name="update_permission"),
    # path("delete-permission/<int:pk>/", views.DeletePermissionView.as_view(), name="delete_permission"),
    # path("assign-permission/<int:role_id>/<int:permission_id>/", views.AssignPermissionView.as_view(), name="assign_permission"),
    # path("remove-permission/<int:role_id>/<int:permission_id>/", views.RemovePermissionView.as_view(), name="remove_permission"),
    # path("list-audits/", views.ListAuditsView.as_view(), name="list_audits"),   
]

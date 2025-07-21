# Permission System Update - Issue #33

This document outlines the changes made to implement role-based permissions for the AccountingSystem backend.

## Summary of Changes

### 1. Custom Permission Classes (`core/permissions.py`)

- **IsSuperUserOnly**: Restricts access to superusers only
- **IsManagerOrAbove**: Allows managers and admins
- **CanManageUsers**: Role-based user management with hierarchy enforcement

### 2. Role Hierarchy

The system now enforces the following role hierarchy:
```
Admin (Superuser) > Admin > Manager > Cashier
```

### 3. Updated Permissions by Operation

#### Bills
- **UPDATE**: Only superusers (`IsSuperUserOnly`)
- **DELETE**: Only superusers (`IsSuperUserOnly`) - *new endpoint added*
- **CREATE/READ**: All authenticated users (unchanged)

#### Transactions  
- **UPDATE**: Only superusers (`IsSuperUserOnly`)
- **DELETE**: Only superusers (`IsSuperUserOnly`)
- **CREATE/READ**: All authenticated users (unchanged)

#### User Management
- **DELETE**: Only superusers (`IsSuperUserOnly`)
- **REGISTER**: Role-based (`CanManageUsers`)
  - Superusers/Admins: Can create any user
  - Managers: Can only create cashiers
- **UPDATE**: Role-based (`CanManageUsers`)
  - Same hierarchy restrictions as registration

### 4. New Endpoints

- `DELETE /api/bills/{id}/delete/` - Delete a bill (superuser only)

### 5. Test Coverage

Comprehensive test suite with 16 tests covering:
- Bill permission scenarios (7 tests)
- Transaction permission scenarios (4 tests)  
- User management permission scenarios (5 tests)

All tests passing ✅

## API Examples

### Superuser Operations (✅ Allowed)
```bash
# Update bill (superuser only)
PUT /api/bills/1/update/ 
Authorization: Bearer <superuser_token>

# Delete bill (superuser only)
DELETE /api/bills/1/delete/
Authorization: Bearer <superuser_token>

# Delete transaction (superuser only) 
DELETE /api/transactions/delete/1/
Authorization: Bearer <superuser_token>
```

### Manager Operations
```bash
# ✅ Allowed: Create cashier
POST /api/accounts/register/
{
  "role": "cashier",
  "email": "cashier@example.com",
  ...
}

# ❌ Forbidden: Create admin
POST /api/accounts/register/  
{
  "role": "admin",
  "email": "admin@example.com", 
  ...
}

# ❌ Forbidden: Update/Delete bills or transactions
PUT /api/bills/1/update/
DELETE /api/bills/1/delete/
```

### Cashier Operations
```bash
# ✅ Allowed: Create bills and transactions
POST /api/bills/
POST /api/transactions/create/

# ❌ Forbidden: Update/Delete bills or transactions
PUT /api/bills/1/update/
DELETE /api/transactions/delete/1/

# ❌ Forbidden: User management
POST /api/accounts/register/
```

## Security Improvements

1. **Principle of Least Privilege**: Users only have access to operations they need
2. **Role Hierarchy**: Managers can only manage users below their level
3. **Superuser Protection**: Critical operations (delete, sensitive updates) restricted to superusers
4. **Comprehensive Testing**: All permission scenarios are tested to prevent regressions

## Migration Notes

- No database migrations required
- All existing functionality preserved for read/create operations
- Only update/delete operations have restricted permissions
- Backward compatible with existing API clients for non-restricted operations
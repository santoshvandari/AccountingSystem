# API Reference

Base URL: `${HOST}/api`

Authentication: JWT in `Authorization: Bearer <token>`

## Accounts

- POST `/accounts/login/`
  - body: `{ email, password }`
  - resp: `{ access, email, full_name, role }`

- GET `/accounts/profile/`
  - resp: profile fields

- PUT `/accounts/update-profile/`
  - body: partial profile

- POST `/accounts/change-password/`
  - body: `{ old_password, new_password, confirm_password }`

- GET `/accounts/user/` (admin, manager)
  - resp: list of users (admins see all; managers see cashiers)

- POST `/accounts/register/` (admin; manager -> cashier only)
  - body: `email, username, full_name, phone_number?, role, password`

- DELETE `/accounts/delete-user/` (superuser)
  - body: `{ email }`

## Transactions

- GET `/transactions/`
- POST `/transactions/create/`
  - body: `{ received_from, amount, note?, date }`
- GET `/transactions/details/:id/`
- PUT `/transactions/update/:id/`
- DELETE `/transactions/delete/:id/`
- GET `/transactions/summary/`

## Bills

- GET `/bills/`
- POST `/bills/`
  - body: bill object with `bill_items` array
- GET `/bills/:id/`
- PUT `/bills/:id/update/`
- DELETE `/bills/:id/delete/`

Notes:
- Invoices compute totals server-side. Provide clean numeric values for `unit_price`, `quantity`.
- Date/times are UTC ISO unless specified.

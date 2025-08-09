# AccountingSystem Architecture

This document explains the overall architecture, components, and data flow of the AccountingSystem project.

## Overview

- Backend: Django 5 + Django REST Framework (DRF), JWT Auth (simplejwt)
- Frontend: React (Vite), Tailwind CSS, Context API
- Database: SQLite (dev) — replaceable by Postgres/MySQL in production

## Modules

- accounts: custom user model, auth endpoints, role system
- transactions: CRUD transactions with permissions
- billing: invoices with items, totals, and payment info

## Authentication

- JWT issued on login: access token returned from backend
- Frontend stores token (localStorage) via helpers and attaches it to requests
- Protected routes check `useAuth()` state

## Authorization

- Roles: admin, manager, cashier
- Custom DRF permissions in `core/permissions.py` gate endpoints
- Summary:
  - Admin: full access except delete guarded for superuser in some cases
  - Manager: create/read/update on most resources
  - Cashier: create/read only

## API Endpoints

- Base path: `/api`
- Accounts: `/api/accounts/*` (login, profile, register, user list, etc.)
- Transactions: `/api/transactions/*`
- Bills: `/api/bills/*`

Swagger/Redoc enabled in DEBUG:
- `/docs/` (Swagger UI)
- `/redoc/`

## Data Model

- accounts.User: email login, role, profile info
- transactions.Transaction: amount, date, note, FK to user
- billing.Bill: bill meta, amounts; BillItem: per-line items

Bill totals auto-compute in model save to ensure consistency.

## Frontend Structure

- `src/components`: Buttons, Cards, Tables, Modals, etc.
- `src/pages`: Dashboard, Transactions, Bills, Users, Settings, Login
- `src/contexts/AuthContext.jsx`: auth state, protected routes in `App.jsx`
- `src/api`: `base.js` + endpoint modules; injects JWT, handles errors

## Styling & UI

- Tailwind CSS v4 via @tailwindcss/vite
- Consistent headers, cards, tables; charts on dashboard via recharts

## Build/Run

- Backend: Django manage.py runserver
- Frontend: Vite dev server; `VITE_API_URL` must point to backend origin

## Future Enhancements

- Use Postgres and proper secrets for production
- Add pagination/sorting on list APIs
- Add refresh token handling on frontend
- Dark mode/theme switcher

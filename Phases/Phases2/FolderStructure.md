# Phase 2 - Backend Folder Structure

## Implemented Backend Structure
backend/
├── apps/                               # All domain-driven apps
│   ├── auth/                           # Users, memberships, roles
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── membership.py
│   │   │   └── role.py
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── membership.py
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── auth_views.py
│   │   │   └── membership_views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── utils.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_users.py
│   │       └── test_memberships.py
│   │
│   ├── billing/                        # Invoices, payments
│   ├── inventory/                      # Products, vendors, stock
│   ├── expenses/                       # Expense categories, expenses
│   ├── reports/                        # Aggregated, read-only endpoints
│   ├── business_settings/              # Business profile & settings
│   └── notifications/                  # Templates, logs, celery tasks
│
├── common/                             # Shared codebase
│   ├── __init__.py
│   ├── models.py                       # Base models, mixins
│   ├── permissions.py                  # Role-based + object-level perms
│   ├── filters.py                      # Search, date range
│   ├── pagination.py                   # DefaultPagination
│   ├── enums.py                        # InvoiceStatus, Currencies, UOM, etc.
│   ├── exceptions.py                   # Standard error responses
│   ├── middleware.py                   # Tenant extraction
│   ├── utils.py
│   └── validators.py
│
├── config/                             # Project-wide settings & entrypoints
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py
│
├── scripts/                            # Data migration / seeders
│   ├── seed_business.py
│   └── migrate_phase1_to_phase2.py
│
├── tests/                              # Global test helpers (optional)
│   ├── factories.py
│   └── conftest.py
│
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .gitignore

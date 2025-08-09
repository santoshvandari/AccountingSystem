# Developer Guide

This guide helps new contributors set up, understand, and extend the AccountingSystem.

## Prerequisites
- Python 3.12+
- Node.js 20+
- npm

## Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # follow prompts
python manage.py runserver 0.0.0.0:8000
```
Swagger (debug): http://localhost:8000/docs/

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # or create with VITE_API_URL
npm run dev
```
Create `.env` with:
```
VITE_API_URL=http://localhost:8000
```

## Repository Structure
```
backend/
  core/            # settings, urls, permissions
  accounts/        # user model, auth, RBAC
  transactions/    # transaction CRUD
  billing/         # invoices + items
frontend/
  src/             # React app (components/pages/api)
```

## Code Style
- Python: PEP 8, DRF best practices
- JS: ESLint defaults, React hooks rules
- Commit messages: Conventional short summary, imperative mood

## Backend Notes
- Custom user model `accounts.User` with `email` as username.
- Permissions in `core/permissions.py` implement RBAC:
  - Admin: full; Manager: create/read/update; Cashier: create/read
  - Delete operations often require superuser
- Billing model computes totals in `save()` and via item updates.

## Frontend Notes
- AuthContext manages JWT, profile, and login/logout.
- API layer in `src/api/base.js` attaches Authorization and handles errors.
- Layout and UI are built with Tailwind; components are reusable.

## Adding Features
- Add backend endpoint (serializer, view, url, permission)
- Update frontend API module
- Build a page or extend existing components
- Ensure role permissions match backend

## Testing & QA
- Add DRF tests per app (accounts/transactions/billing)
- Frontend: test critical flows manually (login, CRUD, invoices)

## Deployment
- Use Postgres in production
- Configure `ALLOWED_HOSTS`, CORS, SECRET_KEY via env
- Serve static files (whitenoise or CDN)
- Build frontend and serve via CDN or reverse proxy

## Troubleshooting
- 401 errors: token invalid/expired -> login again
- CORS issues: update CORS settings on backend
- Totals mismatched: ensure numeric payloads for invoice items

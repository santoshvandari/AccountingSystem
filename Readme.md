# AccountingSystem

A full‑stack Accounting System with a Django REST API backend and a modern React (Vite + Tailwind) frontend. Features role‑based access control, transactions, invoicing, and a polished UI.

## Contents
- Overview
- Tech Stack
- Quick Start (Backend + Frontend)
- Environment Variables
- Project Structure
- Core Features
- API Docs
- Architecture
- Developer Guide

## Overview
This project provides:
- Authentication with JWT and a custom user model
- Role‑based permissions (admin, manager, cashier)
- Transactions CRUD
- Invoicing with items, tax/discount, totals, and printing/PDF
- Dashboard with charts

## Tech Stack
- Backend: Django 5, DRF, simplejwt, drf-yasg, SQLite (dev)
- Frontend: React 19, Vite 7, Tailwind 4, Lucide icons, Recharts

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```
Swagger UI (debug): http://localhost:8000/docs/

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # ensure VITE_API_URL points to backend
npm run dev
```
App: http://localhost:5173

## Environment Variables
Frontend `.env`:
```
VITE_API_URL=http://localhost:8000
```
Backend (recommended via real env in prod):
- DEBUG, SECRET_KEY, ALLOWED_HOSTS, DB config, CORS

## Project Structure
```
backend/
  core/ (settings, urls, permissions)
  accounts/ (auth, user, RBAC)
  transactions/
  billing/
frontend/
  src/ (components, pages, api, contexts)
  vite.config.js
```

## Core Features
- Auth: Login, profile, change password
- Users: Admin/Manager creation; superuser deletion
- Transactions: CRUD with permissions
- Billing: Create/Update/Delete invoices, compute totals; PDF/Print from frontend
- Dashboard: Stats + charts

## API Docs
- See docs/API.md for routes
- Swagger/Redoc in dev at backend `/docs` and `/redoc`

## Architecture & Developer Docs
- See docs/ARCHITECTURE.md and docs/DEVELOPER_GUIDE.md

## Notes
- Replace SQLite with Postgres in production
- Harden SECRET_KEY, CORS, and ALLOWED_HOSTS
- Add pagination and server‑side filtering before scaling

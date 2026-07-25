# Healthcare Backend

A backend system for a healthcare application built with Django, Django REST
Framework, and PostgreSQL. Users can register, log in, and manage patient
and doctor records, and assign doctors to patients — all secured with JWT
authentication.

This is the API only. The companion React app lives in [`../frontend`](../frontend/README.md).

## Tech stack

- **Django 5.2** + **Django REST Framework 3.16**
- **PostgreSQL 16** (via Docker)
- **djangorestframework-simplejwt** for JWT authentication
- **django-environ** for environment-based configuration
- **django-cors-headers** to allow the React dev server to call this API

## Project structure

```
config/         Project settings, root URLconf, custom DRF exception handler
accounts/       Custom User model (email-based) + register/login
patients/       Patient model & CRUD API (scoped to the creating user)
doctors/        Doctor model & CRUD API (shared directory for all users)
mappings/       Patient-Doctor mapping model & API
docker-compose.yml   PostgreSQL service
.env.example    Template for required environment variables
```

## Setup

### 1. Prerequisites

- Python 3.11+
- Docker Desktop (for PostgreSQL)

### 2. Clone and configure environment variables

Copy `.env.example` to `.env` and fill in your own values (especially
`DJANGO_SECRET_KEY` and the Postgres credentials):

```powershell
Copy-Item .env.example .env
```

Generate a secret key if needed:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Start PostgreSQL with Docker

```powershell
docker compose up -d
```

This starts a `postgres:16-alpine` container using the credentials from
`.env` (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`).
Data persists in a named Docker volume (`postgres_data`).

> If port 5432 is already taken on your machine, set `POSTGRES_PORT` in
> `.env` to a free port (e.g. `5433`) before starting the container. The
> Django app reads the same variable so no other changes are needed.
> This repo's `.env` already defaults to `5433` for that reason.

### 4. Create a virtual environment and install dependencies

```powershell
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
```

### 5. Run migrations

```powershell
.\venv\Scripts\python.exe manage.py migrate
```

### 6. (Optional) Create an admin superuser

```powershell
.\venv\Scripts\python.exe manage.py createsuperuser
```

### 7. Run the development server

```powershell
.\venv\Scripts\python.exe manage.py runserver
```

The API is now available at `http://127.0.0.1:8000/`.

## Authentication

JWT authentication is used throughout. After logging in, include the access
token on every protected request:

```
Authorization: Bearer <access_token>
```

Access tokens expire after `ACCESS_TOKEN_LIFETIME_MINUTES` (default 60 min);
use the refresh endpoint to get a new one without logging in again.

## API Reference

All responses are JSON. Error responses use a consistent envelope:

```json
{ "error": { "detail": "...", "status_code": 400 } }
```

### Authentication

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | No | Register a new user |
| POST | `/api/auth/login/` | No | Log in, returns JWT access + refresh tokens |
| POST | `/api/auth/login/refresh/` | No | Exchange a refresh token for a new access token |

**Register**

```
POST /api/auth/register/
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassw0rd"
}
```

Response `201`:
```json
{
  "message": "User registered successfully.",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "created_at": "..." }
}
```

**Login**

```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "StrongPassw0rd"
}
```

Response `200`:
```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "created_at": "..." }
}
```

### Patients

All endpoints require `Authorization: Bearer <access_token>`. Patients are
scoped to the user who created them — a user can only see, update, or delete
patients they created.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/patients/` | Add a new patient |
| GET | `/api/patients/` | List patients created by the authenticated user |
| GET | `/api/patients/<id>/` | Get a specific patient |
| PUT | `/api/patients/<id>/` | Update a patient |
| DELETE | `/api/patients/<id>/` | Delete a patient |

Patient fields: `name`, `age`, `gender` (`male`/`female`/`other`), `address`,
`phone_number`, `medical_history` (all except `name`/`age`/`gender` are
optional).

### Doctors

All endpoints require authentication. Doctors form a shared directory: any
authenticated user can list, view, update, or delete any doctor record (not
just ones they created), per the assignment spec ("Retrieve all doctors").

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/doctors/` | Add a new doctor |
| GET | `/api/doctors/` | List all doctors |
| GET | `/api/doctors/<id>/` | Get a specific doctor |
| PUT | `/api/doctors/<id>/` | Update a doctor |
| DELETE | `/api/doctors/<id>/` | Delete a doctor |

Doctor fields: `name`, `specialization`, `email` (unique), `phone_number`,
`years_of_experience`.

### Patient-Doctor mappings

All endpoints require authentication and are scoped to patients owned by the
authenticated user.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/mappings/` | Assign a doctor to a patient |
| GET | `/api/mappings/` | List all mappings for the authenticated user's patients |
| GET | `/api/mappings/<patient_id>/` | Get all doctors assigned to a specific patient |
| DELETE | `/api/mappings/<id>/` | Remove a mapping (mapping id, not patient id) |

> Note: per the assignment spec, `GET /api/mappings/<patient_id>/` and
> `DELETE /api/mappings/<id>/` intentionally use the same URL shape with
> different id semantics depending on the HTTP method — GET takes a
> **patient** id, DELETE takes a **mapping** id.

**Create a mapping**

```
POST /api/mappings/
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "patient": 1,
  "doctor": 2
}
```

A patient can only be mapped to the same doctor once (enforced by a unique
constraint), and you may only map patients you created.

## Environment variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Django's cryptographic signing key |
| `DJANGO_DEBUG` | `True`/`False` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` | Database connection, shared by Django and docker-compose |
| `ACCESS_TOKEN_LIFETIME_MINUTES`, `REFRESH_TOKEN_LIFETIME_DAYS` | JWT token lifetimes |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API (defaults to the Vite dev server) |

## Running with the frontend

1. Start this backend (steps above) — it listens on `http://127.0.0.1:8000/`.
2. In a separate terminal, start the frontend (see [`../frontend/README.md`](../frontend/README.md)) — it listens on `http://localhost:5173/`.
3. The frontend's `.env` points at this API via `VITE_API_BASE_URL`; CORS is already configured to allow that origin.

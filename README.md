# Healthcare Backend + Frontend

Full-stack healthcare records app: Django REST API + PostgreSQL backend, and
a minimal React frontend.

```
backend/    Django + DRF + PostgreSQL API, JWT auth (see backend/README.md)
frontend/   React (Vite) app that consumes the API (see frontend/README.md)
```

## Quick start

1. **Backend** — follow [`backend/README.md`](backend/README.md): start
   PostgreSQL with Docker, set up the virtual environment, run migrations,
   then `python manage.py runserver` (listens on `http://127.0.0.1:8000/`).
2. **Frontend** — follow [`frontend/README.md`](frontend/README.md):
   `npm install` then `npm run dev` (listens on `http://localhost:5173/`).
3. Open `http://localhost:5173/`, register a user, and start adding
   patients, doctors, and mappings.

The backend already allows CORS requests from the frontend's dev origin, so
no extra configuration is needed to run both together locally.

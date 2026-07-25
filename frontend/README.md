# Healthcare Frontend

A minimal React app for the [Healthcare Backend](../backend/README.md) API.
Lets a user register, log in, and manage patients, doctors, and
patient-doctor mappings.

## Tech stack

- **React 19** + **Vite**
- **react-router-dom** for routing
- **axios** for API calls
- Plain CSS (no UI framework) — kept deliberately minimal

## Setup

### 1. Prerequisites

- Node.js 20.19+ / 22.12+ (Vite 8 requirement)
- The backend running at `http://127.0.0.1:8000/` (see [`../backend/README.md`](../backend/README.md))

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure the API URL

`.env` already points at the local backend by default:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Copy `.env.example` to `.env` if you need to change it (e.g. a different
backend port).

### 4. Run the dev server

```powershell
npm run dev
```

Open `http://localhost:5173/`.

### 5. Build for production

```powershell
npm run build
```

Output goes to `dist/`. Preview it locally with `npm run preview`.

## Project structure

```
src/
  api/            axios client + one module per resource (auth, patients, doctors, mappings)
  context/        AuthContext — holds the logged-in user, wraps login/register/logout
  components/     Navbar, ProtectedRoute
  pages/          LoginPage, RegisterPage, PatientsPage, DoctorsPage, MappingsPage
```

## How auth works

- On login, the JWT `access`/`refresh` tokens and user info are stored in
  `localStorage`.
- An axios request interceptor attaches `Authorization: Bearer <access>` to
  every API call automatically.
- `ProtectedRoute` redirects to `/login` if there's no logged-in user.
- Logout just clears `localStorage` and local state (no server-side call,
  since the backend doesn't implement token blacklisting).

## Pages

- **/login**, **/register** — public
- **/patients** — add/edit/delete/list patients you created
- **/doctors** — add/edit/delete/list all doctors (shared directory)
- **/mappings** — assign a doctor to a patient, filter mappings by patient, remove a mapping

## Notes

- This is intentionally minimal: no state management library, no component
  library, no TypeScript — plain React state + fetch-on-mount per page.
- Error messages from the backend's `{error: {detail, status_code}}`
  envelope are unwrapped and shown inline on each form.

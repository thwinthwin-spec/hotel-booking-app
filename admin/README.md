# Hotel Booking Admin

Optional administration web panel for the Hotel Booking application. Built with React 18, Vite 5, Tailwind CSS 3, react-router-dom v6 and axios.

## Features

- JWT login with admin-only route guard (`localStorage` session)
- Responsive sidebar layout with topbar and logout
- Dashboard with key metrics and recent bookings
- Hotel CRUD (create / read / update / delete) via a modal form
- Room CRUD with multi-image `FormData` upload and hotel dropdown
- Booking list with status filter and inline status updates
- User list with inline role updates
- Loading spinners, error banners and friendly empty states on every data page

## Getting started

```bash
cd admin
npm install
npm run dev
```

The dev server starts on `http://localhost:5174`.

### Environment

Copy `.env.example` to `.env` and point it at your API:

```env
VITE_API_URL=http://localhost:5000/api
```

If the variable is omitted, the app falls back to `http://localhost:5000/api`.

### Demo credentials

| Email | Password |
| --- | --- |
| `admin@test.com` | `123456` |

Use the **Use demo account** button on the login screen to fill these automatically. The account must exist in the backend and have the `admin` role.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Project structure

```
admin/
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx                 # Route configuration
    ├── main.jsx                # React entry point + BrowserRouter
    ├── index.css               # Tailwind directives + small component classes
    ├── api/
    │   ├── axios.js            # Shared axios instance, auth interceptor, error helper
    │   ├── authApi.js          # Login / me
    │   ├── hotelApi.js         # Hotel CRUD
    │   ├── roomApi.js          # Room CRUD (FormData)
    │   ├── bookingApi.js       # Booking list + status update
    │   └── userApi.js          # User list + role update
    ├── components/
    │   ├── Layout.jsx          # Sidebar + topbar + <Outlet />
    │   ├── ProtectedRoute.jsx  # Admin-only guard
    │   ├── StatCard.jsx        # Dashboard metric tile
    │   ├── Modal.jsx           # Reusable dialog
    │   └── Table.jsx           # Generic data table
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── HotelsPage.jsx
        ├── RoomsPage.jsx
        ├── BookingsPage.jsx
        └── UsersPage.jsx
```

## API contract used

| Page | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `GET /auth/me` |
| Dashboard | `GET /admin/dashboard` |
| Hotels | `GET /hotels`, `POST /hotels`, `PUT /hotels/:id`, `DELETE /hotels/:id` |
| Rooms | `GET /rooms`, `POST /rooms`, `PUT /rooms/:id`, `DELETE /rooms/:id` |
| Bookings | `GET /bookings`, `PUT /bookings/:id/status` |
| Users | `GET /admin/users`, `PUT /admin/users/:id/role` |

All protected endpoints expect `Authorization: Bearer <token>`, which the axios request interceptor adds automatically. A `401` response clears the saved session and redirects to `/login`.

## Notes

- Room images are sent as multiple `images` fields in `FormData`. When editing, new files are only appended if selected, so existing images are preserved otherwise.
- Amenity IDs and image URLs for hotels are entered as comma-separated lists in the modal forms.
- Booking status and user role changes are optimistic: the UI updates immediately and rolls back if the API request fails.

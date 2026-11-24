import { Navigate, Outlet } from 'react-router-dom';

/**
 * Gate for admin-only routes.
 * We read the user from localStorage so a page refresh keeps the session.
 */
export default function ProtectedRoute() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    // Corrupted JSON is treated as "not logged in".
    user = null;
  }

  const token = localStorage.getItem('token');
  const isAdmin = Boolean(token) && Boolean(user) && user.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

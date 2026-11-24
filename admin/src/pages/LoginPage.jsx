import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Hotel, Lock, Mail } from 'lucide-react';
import { login as loginRequest } from '../api/authApi';
import { getErrorMessage } from '../api/axios';

const DEMO = { email: 'admin@test.com', password: '123456' };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If an admin session already exists there is no reason to show the form.
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      if (localStorage.getItem('token') && stored && stored.role === 'admin') {
        navigate('/', { replace: true });
      }
    } catch {
      // Ignore malformed localStorage and let the user log in again.
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginRequest({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err) || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Hotel className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Hotel Booking Admin</h1>
          <p className="text-sm text-slate-500">Sign in to manage your properties and bookings.</p>
        </div>

        <div className="card p-6 sm:p-8">
          {error ? (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  className="input pl-9"
                  placeholder="admin@test.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  className="input pl-9"
                  placeholder="••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600">
            <p className="font-medium text-slate-700">Demo credentials</p>
            <p className="mt-1">
              Email: <span className="font-mono">{DEMO.email}</span> · Password:{' '}
              <span className="font-mono">{DEMO.password}</span>
            </p>
            <button
              type="button"
              className="mt-2 text-indigo-600 hover:text-indigo-800 hover:underline"
              onClick={() => {
                setEmail(DEMO.email);
                setPassword(DEMO.password);
                setError('');
              }}
            >
              Use demo account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

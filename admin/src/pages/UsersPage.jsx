import { useEffect, useState } from 'react';
import { AlertCircle, Users } from 'lucide-react';
import { getUsers, updateUserRole } from '../api/userApi';
import { getErrorMessage } from '../api/axios';
import Table from '../components/Table';

const ROLE_OPTIONS = ['user', 'admin'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUsers({ page: 1, limit: 100 });
        if (active) setUsers(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRoleChange = async (user, nextRole) => {
    setError('');
    setUpdatingId(user._id);

    // Optimistic update with rollback on failure.
    setUsers((previous) =>
      previous.map((item) => (item._id === user._id ? { ...item, role: nextRole } : item))
    );

    try {
      const response = await updateUserRole(user._id, nextRole);
      const updated = response && typeof response === 'object' ? response.user || response.data || response : null;
      if (updated && updated._id) {
        setUsers((previous) =>
          previous.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
        );
      }
    } catch (err) {
      setUsers((previous) =>
        previous.map((item) => (item._id === user._id ? { ...item, role: user.role } : item))
      );
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name || '—'}</p>
          <p className="text-xs text-slate-500">{row.email || ''}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email', render: (row) => row.email || '—' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <select
          aria-label={`Change role for ${row.name || row.email || 'user'}`}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm capitalize focus:border-indigo-500 focus:outline-none"
          value={ROLE_OPTIONS.includes(row.role) ? row.role : 'user'}
          onChange={(event) => handleRoleChange(row, event.target.value)}
          disabled={updatingId === row._id}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'active',
      label: 'Active',
      render: (row) => {
        const isActive = row.isActive !== undefined ? row.isActive : row.active !== false;
        return (
          <span className={`badge ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Users</h2>
          <p className="mt-1 text-sm text-slate-500">Manage who can access the guest app and this panel.</p>
        </div>
        <button type="button" className="btn-secondary self-start" onClick={() => setReloadKey((value) => value + 1)}>
          <Users className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <section className="card overflow-hidden">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center gap-3 text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
            Loading users…
          </div>
        ) : (
          <Table columns={columns} rows={users} empty="No users have registered yet." />
        )}
      </section>
    </div>
  );
}

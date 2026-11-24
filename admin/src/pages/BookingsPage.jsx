import { useEffect, useState } from 'react';
import { AlertCircle, CalendarCheck } from 'lucide-react';
import { getBookings, updateBookingStatus } from '../api/bookingApi';
import { getErrorMessage } from '../api/axios';
import Table from '../components/Table';

const STATUS_OPTIONS = ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];

const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const statusStyle = (status) => {
  if (status === 'confirmed' || status === 'checked-in' || status === 'completed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'cancelled') return 'bg-rose-50 text-rose-700';
  return 'bg-amber-50 text-amber-700';
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Pass the filter to the API and also filter locally so the view works
  // even if a backend ignores unknown query parameters.
  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { page: 1, limit: 100 };
        if (statusFilter) params.status = statusFilter;
        const data = await getBookings(params);
        const items = Array.isArray(data.items) ? data.items : [];
        const visible = statusFilter ? items.filter((booking) => booking.status === statusFilter) : items;
        if (active) setBookings(visible);
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
  }, [statusFilter, reloadKey]);

  const handleStatusChange = async (booking, nextStatus) => {
    setError('');
    setUpdatingId(booking._id);

    // Optimistically show the new value; roll back if the request fails.
    setBookings((previous) =>
      previous.map((item) => (item._id === booking._id ? { ...item, status: nextStatus } : item))
    );

    try {
      const response = await updateBookingStatus(booking._id, nextStatus);
      const updated = response && typeof response === 'object' ? response.booking || response.data || response : null;
      if (updated && updated._id) {
        setBookings((previous) =>
          previous.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
        );
      }
    } catch (err) {
      setBookings((previous) =>
        previous.map((item) => (item._id === booking._id ? { ...item, status: booking.status } : item))
      );
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: 'guest',
      label: 'Guest',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.user?.name || '—'}</p>
          <p className="text-xs text-slate-500">{row.user?.email || ''}</p>
        </div>
      ),
    },
    { key: 'hotel', label: 'Hotel', render: (row) => row.hotel?.name || '—' },
    { key: 'room', label: 'Room', render: (row) => row.room?.roomNumber || '—' },
    {
      key: 'dates',
      label: 'Dates',
      render: (row) => (
        <div className="text-xs">
          <p>{dateLabel(row.checkIn)}</p>
          <p className="text-slate-500">→ {dateLabel(row.checkOut)}</p>
        </div>
      ),
    },
    { key: 'nights', label: 'Nights', render: (row) => row.nights ?? '—' },
    { key: 'totalPrice', label: 'Total', render: (row) => money(row.totalPrice) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`badge ${statusStyle(row.status)}`}>{row.status || 'unknown'}</span>
          <select
            aria-label={`Change status for booking ${row._id}`}
            className="rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs focus:border-indigo-500 focus:outline-none"
            value={STATUS_OPTIONS.includes(row.status) ? row.status : 'pending'}
            onChange={(event) => handleStatusChange(row, event.target.value)}
            disabled={updatingId === row._id}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (row) => (
        <div>
          <span className={`badge ${row.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {row.paymentStatus || 'unpaid'}
          </span>
          {row.paymentMethod ? <p className="mt-1 text-xs capitalize text-slate-500">{row.paymentMethod}</p> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Bookings</h2>
          <p className="mt-1 text-sm text-slate-500">Review reservations and update their status.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600" htmlFor="statusFilter">Filter:</label>
          <select
            id="statusFilter"
            className="input w-auto min-w-[150px]"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="button" className="btn-secondary" onClick={() => setReloadKey((value) => value + 1)} title="Refresh">
            <CalendarCheck className="h-4 w-4" />
          </button>
        </div>
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
            Loading bookings…
          </div>
        ) : (
          <Table
            columns={columns}
            rows={bookings}
            empty={statusFilter ? `No ${statusFilter} bookings found.` : 'No bookings have been made yet.'}
          />
        )}
      </section>
    </div>
  );
}

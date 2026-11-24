import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BedDouble,
  CalendarCheck,
  DollarSign,
  Hotel,
  Percent,
  Users,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import StatCard from '../components/StatCard';
import Table from '../components/Table';

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function StatusBadge({ status }) {
  const styles = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-blue-50 text-blue-700',
    pending: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-rose-50 text-rose-700',
  };
  return <span className={`badge ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status || 'unknown'}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // `active` prevents setting state after the component unmounts.
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/admin/dashboard');
        if (active) setData(response.data);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const recentBookings = data?.recentBookings || [];

  const recentColumns = [
    { key: 'guest', label: 'Guest', render: (row) => row.user?.name || row.guest?.name || '—' },
    { key: 'hotel', label: 'Hotel', render: (row) => row.hotel?.name || '—' },
    { key: 'room', label: 'Room', render: (row) => row.room?.roomNumber || '—' },
    { key: 'checkIn', label: 'Check-in', render: (row) => dateLabel(row.checkIn) },
    { key: 'totalPrice', label: 'Total', render: (row) => money(row.totalPrice) },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex items-start gap-3 border-red-200 bg-red-50 p-5 text-red-700">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Could not load the dashboard</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">A quick snapshot of your booking activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Bookings" value={data?.totalBookings ?? 0} icon={CalendarCheck} color="indigo" />
        <StatCard label="Revenue" value={money(data?.totalRevenue)} icon={DollarSign} color="green" />
        <StatCard label="Occupancy" value={`${data?.occupancyRate ?? 0}%`} icon={Percent} color="amber" />
        <StatCard label="Users" value={data?.totalUsers ?? 0} icon={Users} color="blue" />
        <StatCard label="Hotels" value={data?.totalHotels ?? 0} icon={Hotel} color="violet" />
        <StatCard label="Rooms" value={data?.totalRooms ?? 0} icon={BedDouble} color="rose" />
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Recent bookings</h3>
        </div>
        <Table columns={recentColumns} rows={recentBookings} empty="No bookings have been made yet." />
      </section>
    </div>
  );
}

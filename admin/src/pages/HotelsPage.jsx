import { useEffect, useState } from 'react';
import { AlertCircle, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { createHotel, deleteHotel, getHotels, updateHotel } from '../api/hotelApi';
import { getErrorMessage } from '../api/axios';
import Modal from '../components/Modal';
import Table from '../components/Table';

// Form values are plain strings so inputs stay controlled and easy to reset.
const emptyForm = {
  name: '',
  description: '',
  address: '',
  city: '',
  country: '',
  contactPhone: '',
  contactEmail: '',
  imageUrls: '',
  amenityIds: '',
  rating: '',
};

/** Split "a, b,c" into a clean array. */
const csvToArray = (value) =>
  String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

/** Amenities may come back as strings or populated objects; keep their ids. */
const amenitiesToString = (amenities) =>
  (Array.isArray(amenities) ? amenities : [])
    .map((item) => (typeof item === 'object' ? item._id || item.id || item.name || '' : item))
    .filter(Boolean)
    .join(', ');

const firstImage = (hotel) => {
  const image = Array.isArray(hotel.images) ? hotel.images[0] : null;
  if (!image) return '';
  return typeof image === 'string' ? image : image.url || '';
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getHotels({ page, limit: 20 });
        if (!active) return;
        setHotels(Array.isArray(data.items) ? data.items : []);
        setPage(data.page || page);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
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
  }, [page]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (hotel) => {
    setEditing(hotel);
    setForm({
      name: hotel.name || '',
      description: hotel.description || '',
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || '',
      contactPhone: hotel.contact?.phone || '',
      contactEmail: hotel.contact?.email || '',
      imageUrls: (Array.isArray(hotel.images) ? hotel.images : [])
        .map((image) => (typeof image === 'string' ? image : image.url || ''))
        .filter(Boolean)
        .join(', '),
      amenityIds: amenitiesToString(hotel.amenities),
      rating: hotel.rating === undefined || hotel.rating === null ? '' : String(hotel.rating),
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Hotel name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      images: csvToArray(form.imageUrls),
      amenities: csvToArray(form.amenityIds),
      contact: { phone: form.contactPhone.trim(), email: form.contactEmail.trim() },
      rating: form.rating === '' ? 0 : Number(form.rating),
    };

    setSaving(true);
    try {
      if (editing) {
        await updateHotel(editing._id, payload);
      } else {
        await createHotel(payload);
      }
      setModalOpen(false);
      await getHotels({ page, limit: 20 }).then((data) => {
        setHotels(Array.isArray(data.items) ? data.items : []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;

    setDeletingId(hotel._id);
    setError('');
    try {
      await deleteHotel(hotel._id);
      setHotels((previous) => previous.filter((item) => item._id !== hotel._id));
      setTotal((value) => Math.max(0, value - 1));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => {
        const src = firstImage(row);
        return src ? (
          <img src={src} alt={row.name || 'Hotel'} className="h-12 w-16 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-400">
            No image
          </div>
        );
      },
    },
    {
      key: 'name',
      label: 'Hotel',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name || '—'}</p>
          {row.description ? (
            <p className="max-w-[260px] truncate text-xs text-slate-500">{row.description}</p>
          ) : null}
        </div>
      ),
    },
    { key: 'city', label: 'City', render: (row) => row.city || '—' },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-slate-700">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          {row.rating ?? '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary px-2 py-1.5" onClick={() => openEdit(row)} title="Edit hotel">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-danger px-2 py-1.5"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row._id}
            title="Delete hotel"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Hotels</h2>
          <p className="mt-1 text-sm text-slate-500">{total} hotel{total === 1 ? '' : 's'} in your catalog.</p>
        </div>
        <button type="button" className="btn-primary self-start" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add hotel
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
            Loading hotels…
          </div>
        ) : (
          <>
            <Table columns={columns} rows={hotels} empty="No hotels yet. Add your first property to get started." />
            {pages > 1 ? (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
                <span className="text-slate-500">Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </button>
                  <button type="button" className="btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit hotel' : 'Add hotel'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="hotel-form" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create hotel'}
            </button>
          </>
        }
      >
        {formError ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {formError}
          </div>
        ) : null}

        <form id="hotel-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Hotel name *</label>
            <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} className="input" value={form.description} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="address">Address</label>
            <input id="address" name="address" className="input" value={form.address} onChange={handleChange} />
          </div>

          <div>
            <label className="label" htmlFor="city">City</label>
            <input id="city" name="city" className="input" value={form.city} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="country">Country</label>
            <input id="country" name="country" className="input" value={form.country} onChange={handleChange} />
          </div>

          <div>
            <label className="label" htmlFor="contactPhone">Contact phone</label>
            <input id="contactPhone" name="contactPhone" className="input" value={form.contactPhone} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="contactEmail">Contact email</label>
            <input id="contactEmail" name="contactEmail" type="email" className="input" value={form.contactEmail} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="imageUrls">Image URLs (comma separated)</label>
            <input id="imageUrls" name="imageUrls" className="input" placeholder="https://…/one.jpg, https://…/two.jpg" value={form.imageUrls} onChange={handleChange} />
          </div>

          <div>
            <label className="label" htmlFor="amenityIds">Amenity IDs (comma separated)</label>
            <input id="amenityIds" name="amenityIds" className="input" placeholder="wifi, pool, spa" value={form.amenityIds} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="rating">Rating (0–5)</label>
            <input id="rating" name="rating" type="number" min="0" max="5" step="0.1" className="input" value={form.rating} onChange={handleChange} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

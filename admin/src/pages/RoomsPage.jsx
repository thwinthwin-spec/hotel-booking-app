import { useEffect, useState } from 'react';
import { AlertCircle, BedDouble, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteRoom, getRooms, createRoom, updateRoom } from '../api/roomApi';
import { getHotels } from '../api/hotelApi';
import { getErrorMessage } from '../api/axios';
import Modal from '../components/Modal';
import Table from '../components/Table';

const ROOM_TYPES = ['single', 'double', 'suite', 'deluxe'];

const emptyForm = {
  hotel: '',
  roomNumber: '',
  type: 'single',
  pricePerNight: '',
  adults: '2',
  children: '0',
  amenities: '',
  totalRooms: '1',
  isAvailable: true,
  description: '',
};

const csvToArray = (value) =>
  String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const amenitiesToString = (amenities) =>
  (Array.isArray(amenities) ? amenities : [])
    .map((item) => (typeof item === 'object' ? item._id || item.id || item.name || '' : item))
    .filter(Boolean)
    .join(', ');

const firstImage = (room) => {
  const image = Array.isArray(room.images) ? room.images[0] : null;
  if (!image) return '';
  return typeof image === 'string' ? image : image.url || '';
};

// A populated room.hotel is an object; an unpopulated one is just an id string.
const hotelIdOf = (room) => {
  const hotel = room.hotel;
  if (!hotel) return '';
  return typeof hotel === 'object' ? hotel._id || hotel.id || '' : String(hotel);
};

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [hotelList, setHotelList] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFiles, setImageFiles] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Load rooms and the hotel dropdown options together.
  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [roomData, hotelData] = await Promise.all([
          getRooms({ page: 1, limit: 50 }),
          getHotels({ page: 1, limit: 100 }),
        ]);
        if (!active) return;
        setRooms(Array.isArray(roomData.items) ? roomData.items : []);
        setHotelList(Array.isArray(hotelData.items) ? hotelData.items : []);
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

  const hotelNameOf = (room) => {
    const hotel = room.hotel;
    if (hotel && typeof hotel === 'object') return hotel.name || hotelIdOf(room) || '—';
    const id = String(hotel || '');
    return hotelList.find((item) => item._id === id)?.name || id || '—';
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, hotel: hotelList[0]?._id || '' });
    setImageFiles([]);
    setFileInputKey((key) => key + 1);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      hotel: hotelIdOf(room),
      roomNumber: room.roomNumber || '',
      type: ROOM_TYPES.includes(room.type) ? room.type : 'single',
      pricePerNight: room.pricePerNight === undefined || room.pricePerNight === null ? '' : String(room.pricePerNight),
      adults: String(room.capacity?.adults ?? 2),
      children: String(room.capacity?.children ?? 0),
      amenities: amenitiesToString(room.amenities),
      totalRooms: room.totalRooms === undefined || room.totalRooms === null ? '1' : String(room.totalRooms),
      isAvailable: room.isAvailable !== false,
      description: room.description || '',
    });
    setImageFiles([]); // new files only; existing images stay unless replaced
    setFileInputKey((key) => key + 1);
    setFormError('');
    setModalOpen(true);
  };

  /**
   * Build multipart payload.
   * Repeated `amenities` keys and a JSON `capacity` field cover the common
   * Express/multer ways of reading nested data from FormData.
   */
  const buildFormData = () => {
    const data = new FormData();
    const capacity = {
      adults: Number(form.adults) || 0,
      children: Number(form.children) || 0,
    };

    data.append('hotel', form.hotel);
    data.append('roomNumber', form.roomNumber.trim());
    data.append('type', form.type);
    data.append('pricePerNight', form.pricePerNight);
    data.append('totalRooms', form.totalRooms);
    data.append('isAvailable', form.isAvailable ? 'true' : 'false');
    data.append('description', form.description.trim());
    data.append('capacity', JSON.stringify(capacity));
    data.append('capacity[adults]', String(capacity.adults));
    data.append('capacity[children]', String(capacity.children));

    csvToArray(form.amenities).forEach((amenity) => data.append('amenities', amenity));

    // Only send the image field when the admin picked new files.
    imageFiles.forEach((file) => data.append('images', file));

    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.hotel) {
      setFormError('Please choose a hotel.');
      return;
    }
    if (!form.roomNumber.trim()) {
      setFormError('Room number is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = buildFormData();
      if (editing) {
        await updateRoom(editing._id, payload);
      } else {
        await createRoom(payload);
      }
      setModalOpen(false);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNumber}? This cannot be undone.`)) return;

    setDeletingId(room._id);
    setError('');
    try {
      await deleteRoom(room._id);
      setRooms((previous) => previous.filter((item) => item._id !== room._id));
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
          <img src={src} alt={`Room ${row.roomNumber || ''}`} className="h-12 w-16 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-slate-400">
            <BedDouble className="h-5 w-5" />
          </div>
        );
      },
    },
    { key: 'roomNumber', label: 'Room', render: (row) => <span className="font-medium text-slate-900">{row.roomNumber || '—'}</span> },
    { key: 'hotel', label: 'Hotel', render: (row) => hotelNameOf(row) },
    { key: 'type', label: 'Type', render: (row) => <span className="capitalize">{row.type || '—'}</span> },
    { key: 'price', label: 'Price / night', render: (row) => money(row.pricePerNight) },
    { key: 'totalRooms', label: 'Units', render: (row) => row.totalRooms ?? '—' },
    {
      key: 'isAvailable',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.isAvailable === false ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {row.isAvailable === false ? 'Unavailable' : 'Available'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary px-2 py-1.5" onClick={() => openEdit(row)} title="Edit room">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-danger px-2 py-1.5"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row._id}
            title="Delete room"
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
          <h2 className="text-xl font-semibold text-slate-900">Rooms</h2>
          <p className="mt-1 text-sm text-slate-500">Manage room inventory across all hotels.</p>
        </div>
        <button type="button" className="btn-primary self-start" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add room
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
            Loading rooms…
          </div>
        ) : (
          <Table columns={columns} rows={rooms} empty="No rooms found. Add a room to start filling your inventory." />
        )}
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit room' : 'Add room'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="room-form" className="btn-primary" disabled={saving}>
              {saving ? 'Uploading…' : editing ? 'Save changes' : 'Create room'}
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

        {editing && Array.isArray(editing.images) && editing.images.length > 0 ? (
          <div className="mb-4 rounded-lg bg-slate-50 p-3">
            <p className="label">Current images</p>
            <div className="flex flex-wrap gap-2">
              {editing.images.map((image, index) => {
                const src = typeof image === 'string' ? image : image.url || '';
                return src ? (
                  <img key={index} src={src} alt={`Existing ${index + 1}`} className="h-14 w-20 rounded object-cover" />
                ) : null;
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">Uploading new files replaces the existing image set.</p>
          </div>
        ) : null}

        <form id="room-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="hotel">Hotel *</label>
            <select id="hotel" name="hotel" className="input" value={form.hotel} onChange={handleChange} required>
              <option value="">Select a hotel…</option>
              {hotelList.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="roomNumber">Room number *</label>
            <input id="roomNumber" name="roomNumber" className="input" value={form.roomNumber} onChange={handleChange} required />
          </div>
          <div>
            <label className="label" htmlFor="type">Room type</label>
            <select id="type" name="type" className="input" value={form.type} onChange={handleChange}>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="pricePerNight">Price per night</label>
            <input id="pricePerNight" name="pricePerNight" type="number" min="0" step="0.01" className="input" value={form.pricePerNight} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="totalRooms">Number of units</label>
            <input id="totalRooms" name="totalRooms" type="number" min="1" className="input" value={form.totalRooms} onChange={handleChange} />
          </div>

          <div>
            <label className="label" htmlFor="adults">Capacity — adults</label>
            <input id="adults" name="adults" type="number" min="0" className="input" value={form.adults} onChange={handleChange} />
          </div>
          <div>
            <label className="label" htmlFor="children">Capacity — children</label>
            <input id="children" name="children" type="number" min="0" className="input" value={form.children} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="amenities">Amenities (comma separated)</label>
            <input id="amenities" name="amenities" className="input" placeholder="wifi, breakfast, balcony" value={form.amenities} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="images">Images</label>
            <input
              key={fileInputKey}
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="input"
              onChange={(event) => setImageFiles(Array.from(event.target.files || []))}
            />
            {imageFiles.length > 0 ? (
              <p className="mt-1 text-xs text-slate-500">{imageFiles.length} file{imageFiles.length === 1 ? '' : 's'} selected.</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} className="input" value={form.description} onChange={handleChange} />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Available for booking
          </label>
        </form>
      </Modal>
    </div>
  );
}

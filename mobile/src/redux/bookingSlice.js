/** Booking state and thunks for guest bookings plus admin management. */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createBookingApi,
  fetchMyBookingsApi,
  fetchBookingByIdApi,
  cancelBookingApi,
  fetchAllBookingsApi,
  updateBookingStatusApi,
} from '../api/bookingApi';

const initialState = { bookings: [], current: null, loading: false, error: null };

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createBookingApi(payload);
      return data.booking;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchMyBookingsApi();
      return data.items || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await fetchBookingByIdApi(id);
      return data.booking || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await cancelBookingApi(id);
      return data.booking;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'booking/fetchAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchAllBookingsApi();
      return data.items || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'booking/updateBookingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await updateBookingStatusApi(id, status);
      return data.booking;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // Every thunk shares the same loading/error lifecycle.
    [
      createBooking,
      fetchMyBookings,
      fetchBookingById,
      cancelBooking,
      fetchAllBookings,
      updateBookingStatus,
    ].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        });
    });

    builder
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.bookings = state.bookings.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
        state.bookings = state.bookings.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      });
  },
});

export const { clearCurrent } = bookingSlice.actions;
export default bookingSlice.reducer;

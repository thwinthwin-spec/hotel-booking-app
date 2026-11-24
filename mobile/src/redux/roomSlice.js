/** Room search state used by list/detail screens. */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRoomsApi, fetchRoomByIdApi } from '../api/roomApi';

const initialState = { rooms: [], current: null, loading: false, error: null };

export const fetchRooms = createAsyncThunk(
  'room/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await fetchRoomsApi(params);
      return data.items || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'room/fetchRoomById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await fetchRoomByIdApi(id);
      return data.room || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearCurrent } = roomSlice.actions;
export default roomSlice.reducer;

/**
 * Auth state + async thunks. Token/user are mirrored into AsyncStorage so the
 * session survives a reload; AppNavigator reads state.auth.token to choose
 * between the auth stack and the main tabs.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerApi,
  loginApi,
  getMeApi,
  updateProfileApi,
} from '../api/authApi';

const initialState = { user: null, token: null, loading: false, error: null };

/** Persist the session after login/register. */
async function persistSession(token, user) {
  if (token) await AsyncStorage.setItem('token', token);
  if (user) await AsyncStorage.setItem('user', JSON.stringify(user));
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await loginApi({ email, password });
      await persistSession(data.token, data.user);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await registerApi(payload);
      await persistSession(data.token, data.user);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** Restore the current user using the stored JWT (called from SplashScreen). */
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return rejectWithValue('No saved session');
      const { data } = await getMeApi();
      const user = data.user || data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await updateProfileApi(payload);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/** Local-only logout (no network call, so it can never loop on 401). */
export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    [login, register, loadUser, updateProfile].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
          if (action.payload.token) state.token = action.payload.token;
          if (action.payload.user) state.user = action.payload.user;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        });
    });

    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, () => ({ ...initialState }))
      .addCase(logout.rejected, (state) => {
        // Even if storage fails, clear in-memory auth so the UI is consistent.
        state.loading = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

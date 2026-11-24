/** Redux Toolkit store wiring auth, booking, and room reducers together. */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice';
import roomReducer from './roomSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    room: roomReducer,
  },
});

export default store;

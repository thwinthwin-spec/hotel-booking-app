/**
 * App entry point: Redux Provider + status bar + root navigator.
 * Expo loads this file via node_modules/expo/AppEntry.js (see package.json).
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar style="dark" />
        <AppNavigator />
      </Provider>
    </GestureHandlerRootView>
  );
}

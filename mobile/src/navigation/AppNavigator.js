/** Root navigator: chooses the auth flow or main tabs from Redux token state. */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export default function AppNavigator() {
  const token = useSelector((state) => state.auth.token);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

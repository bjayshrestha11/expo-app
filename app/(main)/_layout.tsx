import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useUser } from '@/hooks/use-user';
import { useAuthenticated } from '@/hooks/useAuth';
import { useLoading } from '@/providers/auth-provider';

const MainLayout = () => {
  const { loading } = useLoading();
  const { user } = useUser();
  useAuthenticated();

  if (loading || !user)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default MainLayout;

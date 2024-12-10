import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useUser } from '@/hooks/use-user';
import { useNotAuthenticated } from '@/hooks/useAuth';
import { useLoading } from '@/providers/auth-provider';

const AuthLayout = () => {
  const { loading } = useLoading();
  const { user } = useUser();
  useNotAuthenticated();

  if (loading || (user && !user.profileDetails.shopAssistantPasswordExpired))
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );

  return <Stack />;
};

export default AuthLayout;

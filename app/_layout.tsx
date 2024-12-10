import { PortalProvider } from '@gorhom/portal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Toaster } from 'burnt/web';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useGetUserProfile } from '@/api/profile-api';
import { NAV_THEME } from '@/constants/colors';
import { isweb } from '@/constants/data';
import useAuthInit from '@/hooks/use-auth-init';
import { useColorScheme } from '@/hooks/use-color-scheme';

import '../global.css';

import { useLanguageLoader } from '@/hooks/use-language-loader';
import { useUser } from '@/hooks/use-user';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { AuthProvider, useDeviceToken, useLoading } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (isweb) {
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <PortalProvider>
          <AuthProvider>
            <QueryProvider>
              <Toaster
                toastOptions={{
                  style: {
                    borderRadius: 10,
                  },
                }}
                position="top-center"
                richColors
                theme={colorScheme}
              />
              <MainApp />
            </QueryProvider>
          </AuthProvider>
        </PortalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const MainApp = () => {
  const router = useRouter();
  useAuthInit();
  useGetUserProfile();
  useLanguageLoader();
  const { colorScheme } = useColorScheme();
  const { loading } = useLoading();
  const { user } = useUser();
  const { setDeviceToken } = useDeviceToken();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(main)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <PortalHost />
    </>
  );
};

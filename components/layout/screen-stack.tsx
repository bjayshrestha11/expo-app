import { Stack } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  options?: React.ComponentProps<typeof Stack>['screenOptions'];
  children?: React.ReactNode;
};

export const StackScreen = ({ options, children }: Props) => {
  const { colorScheme } = useColorScheme();
  return (
    <Stack
      screenOptions={{
        ...options,
        // headerStyle: {
        //   backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        // },
        // headerTitleStyle: {
        //   color: colorScheme === 'dark' ? '#fff' : '#000',
        // },
        // headerShown: screenHeaderShown,
        // headerBackVisible: true,
      }}>
      {children}
    </Stack>
  );
};

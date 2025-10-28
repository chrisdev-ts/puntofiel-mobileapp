// app/reward/index.tsx
import RewardsIndexScreen from '@/src/presentation/screens/reward/RewardsIndexScreen';
import { Stack } from 'expo-router';

export default function RewardsIndexRoute() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'PuntoFiel',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#2F4858',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <RewardsIndexScreen />
    </>
  );
}
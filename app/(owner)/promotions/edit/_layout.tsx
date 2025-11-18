import { Stack } from 'expo-router';

export default function EditLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Editar Promoción',
        }}
      />
    </Stack>
  );
}
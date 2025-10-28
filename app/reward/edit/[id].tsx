import EditRewardScreen from '@/src/presentation/screens/reward/EditRewardScreen';
import { Stack } from 'expo-router';

export default function EditRewardRoute() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: ' ',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                    headerTintColor: '#2F4858',
                    headerShadowVisible: true,
                }}
            />
            <EditRewardScreen />
        </>
    );
}
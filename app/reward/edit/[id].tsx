// ========================================
// app/reward/edit/[id].tsx
import EditRewardScreen from '@/src/presentation/screens/reward/EditRewardScreen';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function EditRewardRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <>
            <Stack.Screen
                options={{
                    title: '',
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                    headerTintColor: '#2F4858',
                    headerShadowVisible: true,
                }}
            />
            <EditRewardScreen rewardId={id} />
        </>
    );
}
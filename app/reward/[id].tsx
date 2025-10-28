// ========================================
// app/reward/[id].tsx
import RewardDetailScreen from '@/src/presentation/screens/reward/RewardDetailScreen';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function RewardDetailRoute() {
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
            <RewardDetailScreen rewardId={id} />
        </>
    );
}
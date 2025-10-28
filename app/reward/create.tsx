
import CreateRewardScreen from '@/src/presentation/screens/reward/CreateRewardScreen';
import { Stack } from 'expo-router';

export default function CreateRewardRoute() {
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
            <CreateRewardScreen />
        </>
    );
}
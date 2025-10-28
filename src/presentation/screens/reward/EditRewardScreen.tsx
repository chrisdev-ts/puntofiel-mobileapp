import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { RewardForm } from '@/src/presentation/components/reward';
import { useRewardDetail } from '@/src/presentation/hooks/useRewardDetail';
import { Spinner } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';

export default function EditRewardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    // Cargar datos de la recompensa
    const { data: reward, isLoading, error } = useRewardDetail(id);

    if (isLoading) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center">
                <Spinner size="large" color="#2F4858" />
                <Text className="text-[#6A6A6A] mt-4">Cargando recompensa...</Text>
            </Box>
        );
    }

    if (error || !reward) {
        return (
            <Box className="flex-1 bg-[#FFFFFF] justify-center items-center p-6">
                <Text className="text-[#F44336] text-center">
                    {error?.message || 'No se encontró la recompensa'}
                </Text>
            </Box>
        );
    }

    return (
        <RewardForm
            mode="edit"
            rewardId={id}
            initialData={{
                name: reward.name,
                description: reward.description,
                points_required: reward.pointsRequired,
                image_url: reward.imageUrl,
            }}
        />
    );
}
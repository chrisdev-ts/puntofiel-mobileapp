import { useRewardDetail } from '@/src/presentation/hooks/useRewardDetail';
import { Spinner, Text } from '@gluestack-ui/themed';
import { Box } from '@/components/ui/box';
import RewardFormScreen from './RewardFormScreen';

type EditRewardScreenProps = {
  rewardId: string;
};

export default function EditRewardScreen({ rewardId }: EditRewardScreenProps) {
  // Cargar datos de la recompensa
  const { data: reward, isLoading, error } = useRewardDetail(rewardId);

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
    <RewardFormScreen
      mode="edit"
      rewardId={rewardId}
      initialData={{
        name: reward.name,
        description: reward.description,
        points_required: reward.pointsRequired,
        image_url: reward.imageUrl,
      }}
    />
  );
}
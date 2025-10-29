import { useLocalSearchParams } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { RewardForm } from "@/src/presentation/components/rewards";
import { useRewardDetail } from "@/src/presentation/hooks/useRewardDetail";

export default function EditRewardScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	// Cargar datos de la recompensa
	const { data: reward, isLoading, error } = useRewardDetail(id);

	if (isLoading) {
		return <FeedbackScreen variant="loading" title="Cargando recompensa..." />;
	}

	if (error || !reward) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Recompensa no encontrada"
				description={error?.message || "No se encontró la recompensa"}
			/>
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

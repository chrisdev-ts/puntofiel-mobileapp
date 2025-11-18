import { useLocalSearchParams } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import {
	FeedbackScreen,
	RewardDetailSkeleton,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useRewardDetail } from "@/src/presentation/hooks/useRewardDetail";
import CreateRewardFlow from "@/src/presentation/screens/owner/rewards/CreateRewardFlow";

export default function EditRewardScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	// Cargar datos de la recompensa
	const { data: reward, isLoading, error } = useRewardDetail(id);

	if (isLoading) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<RewardDetailSkeleton />
			</AppLayout>
		);
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
		<CreateRewardFlow
			isEditMode={true}
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

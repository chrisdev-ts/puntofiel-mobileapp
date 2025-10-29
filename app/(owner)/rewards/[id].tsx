import { useLocalSearchParams } from "expo-router";
import RewardDetailScreen from "@/src/presentation/screens/owner/rewards/RewardDetailScreen";

export default function RewardDetailRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();

	if (!id) {
		return null;
	}

	return <RewardDetailScreen rewardId={id} />;
}

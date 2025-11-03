import { useLocalSearchParams } from "expo-router";
import { RewardDetailScreen } from "@/src/presentation/screens/shared";

export default function RewardDetailRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();

	if (!id) {
		return null;
	}

	return <RewardDetailScreen />;
}

import { Spinner } from "@gluestack-ui/themed";
import { useLocalSearchParams } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import RaffleForm from "@/src/presentation/components/raffles/RaffleForm";
import { useRaffleDetail } from "@/src/presentation/hooks/useRaffleDetail";

export default function EditRaffleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	// Cargar datos de la rifa usando el hook específico de detalle
	const { data: raffle, isLoading, error } = useRaffleDetail(id);

	if (isLoading) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<Box className="flex-1 justify-center items-center bg-white">
					<Spinner size="large" color="#2F4858" />
					<Text className="mt-4 text-typography-400">
						Cargando información...
					</Text>
				</Box>
			</AppLayout>
		);
	}

	if (error || !raffle) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Rifa no encontrada"
				description={
					error?.message || "No se pudo cargar la información de la rifa."
				}
			/>
		);
	}

	return (
		<RaffleForm
			mode="edit"
			raffleId={id}
			initialData={{
				name: raffle.name,
				prize: raffle.prize,
				description: raffle.description,
				points_required: raffle.pointsRequired,
				max_tickets_per_user: raffle.maxTicketsPerUser,
				start_date: raffle.startDate,
				end_date: raffle.endDate,
				image_url: raffle.imageUrl,
			}}
		/>
	);
}

import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useRaffleDetail } from "@/src/presentation/hooks/useRaffleDetail";
import { Spinner } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon, EditIcon } from "lucide-react-native";

export default function RaffleDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	// Usamos el hook de detalle para cargar la info
	const { data: raffle, isLoading, error } = useRaffleDetail(id);

	if (isLoading) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<Box className="flex-1 justify-center items-center bg-white">
					<Spinner size="large" color="#2F4858" />
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
				description={error?.message || "No se pudo cargar la información."}
			/>
		);
	}

	return (
		<AppLayout showHeader={true} headerVariant="back" showNavBar={false} headerTitle="Detalle de Rifa">
			<VStack space="md" className="p-4">
				<Heading size="xl" className="text-[#2F4858]">{raffle.name}</Heading>

				<Box className="bg-gray-50 p-4 rounded-lg border border-gray-200">
					<Text className="font-bold text-[#2F4858] mb-1">Premio Principal:</Text>
					<Text className="text-lg text-[#2F4858]">{raffle.prize}</Text>
				</Box>

				<Box className="bg-gray-50 p-4 rounded-lg border border-gray-200">
					<Text className="font-bold text-[#2F4858] mb-1">Detalles:</Text>
					<Text className="text-gray-600">{raffle.description}</Text>
				</Box>

				{/* Botón para ir a Editar (Navega a la carpeta edit/) */}
				<Button
					className="bg-[#2F4858] mt-4"
					onPress={() => router.push(`/(owner)/raffles/edit/${id}` as never)}
				>
					<ButtonIcon as={EditIcon} className="mr-2 text-white" />
					<ButtonText>Editar Rifa</ButtonText>
				</Button>
			</VStack>
		</AppLayout>
	);
}
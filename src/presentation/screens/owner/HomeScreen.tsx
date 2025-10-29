import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
	const router = useRouter();

	return (
		<AppLayout
			showHeader={true}
			showNavBar={true}
			scrollable={true}
			headerVariant="default"
		>
			<VStack className="gap-6">
				<Heading size="xl" className="text-primary-500">
					Dashboard
				</Heading>
				<Text size="lg" className="text-typography-700">
					Bienvenido a tu panel de control
				</Text>
				{/* Acciones rápidas */}
				<VStack className="gap-4">
					<Button
						variant="solid"
						action="primary"
						onPress={() => router.push("/(owner)/(tabs)/scan" as never)}
					>
						<ButtonText>Escanear QR Cliente</ButtonText>
					</Button>

					<Button
						variant="outline"
						action="primary"
						onPress={() => router.push("/(owner)/(tabs)/rewards" as never)}
					>
						<ButtonText>Gestionar Recompensas</ButtonText>
					</Button>
				</VStack>

				{/* Estadísticas rápidas - Por implementar */}
				<Box className="bg-gray-100 p-4 rounded-lg">
					<Text className="text-center text-typography-600">
						Estadísticas próximamente...
					</Text>
				</Box>
			</VStack>
		</AppLayout>
	);
}

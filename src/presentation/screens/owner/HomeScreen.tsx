import { useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

export default function DashboardScreen() {
	const _router = useRouter();

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

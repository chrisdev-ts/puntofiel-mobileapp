import { useLocalSearchParams } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

export default function BusinessDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
			<Heading className="mb-4">Detalle del Negocio</Heading>
			<Text>ID del negocio: {id}</Text>
			<Text className="mt-4">
				Aquí se mostrarán los detalles del negocio y las recompensas
				disponibles.
			</Text>
		</AppLayout>
	);
}

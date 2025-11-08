import { Badge, BadgeText } from "@/components/ui/badge";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function ShowQRScreen() {
	const { user, isLoading } = useAuth();
	const { width } = useWindowDimensions();

	// QR responsive: 70% del ancho de pantalla, máximo 300px
	const qrSize = Math.min(width * 0.7, 300);

	// Obtenemos el userId a partir de user.id
	const userId = user?.id;

	// Manejo del estado de carga
	if (isLoading) {
		return (
			<AppLayout centerContent>
				<Text className="text-lg text-gray-500">
					Cargando datos de usuario...
				</Text>
			</AppLayout>
		);
	}

	// Manejo de error si el ID de usuario falta
	if (!userId) {
		return (
			<AppLayout centerContent>
				<VStack space="md" className="p-8">
					<Text className="text-xl font-bold text-red-600 text-center">
						Error de Sesión
					</Text>
					<Text className="text-gray-600 text-center">
						No pudimos cargar tu ID. Asegúrate de estar logeado correctamente.
					</Text>
				</VStack>
			</AppLayout>
		);
	}

	const qrValue = String(userId);

	// Obtenemos el nombre completo a partir de las propiedades del usuario
	const firstName = user?.firstName || "";
	const lastName = user?.lastName || "";
	const secondLastName = user?.secondLastName || "";

	const userName =
		`${firstName} ${lastName} ${secondLastName}`.trim().replace(/\s+/g, " ") ||
		"Usuario";

	return (
		<AppLayout centerContent>
			<VStack space="2xl" className="items-center px-6">
				<Text className="text-2xl font-bold text-center text-gray-900">
					{userName}
				</Text>

				<VStack space="md" className="items-center">
					<Badge action="success" variant="solid" size="md" className="self-center">
						<BadgeText>Listo para escanear</BadgeText>
					</Badge>

					<View className="bg-white p-6 rounded-2xl border border-gray-200">
						<QRCode
							value={qrValue}
							size={qrSize}
							color="black"
							backgroundColor="white"
						/>
					</View>
				</VStack>

				<Text className="text-center text-base text-gray-600 leading-relaxed">
					Muestra este QR al personal que te esté atendiendo para que pueda
					otorgarte los puntos correspondientes a tu compra.
				</Text>
			</VStack>
		</AppLayout>
	);
}

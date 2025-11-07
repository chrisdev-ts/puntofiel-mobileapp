import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuth } from "@/src/presentation/hooks/useAuth";

export default function ShowQRScreen() {
	const { user, isLoading } = useAuth();

	// Obtenemos el userId a partir de user.id
	const userId = user?.id;

	// Manejo del estado de carga
	if (isLoading) {
		return (
			<AppLayout centerContent>
				<Text className="text-lg text-gray-500 text-center">
					Cargando datos de usuario...
				</Text>
			</AppLayout>
		);
	}

	// Manejo de error si el ID de usuario falta
	if (!userId) {
		return (
			<AppLayout centerContent>
				<View className="p-8">
					<Text className="text-xl font-bold text-red-600 text-center">
						Error de Sesión
					</Text>
					<Text className="mt-2 text-gray-600 text-center">
						No pudimos cargar tu ID. Asegúrate de estar logeado correctamente.
					</Text>
				</View>
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
			<View className="items-center px-6">
				<Text className="text-xl font-semibold mb-8 text-center">
					{userName}
				</Text>

				<QRCode
					value={qrValue}
					size={280}
					color="black"
					backgroundColor="white"
				/>

				<Text className="text-center text-base text-gray-600 mt-8 px-4">
					Muestra este QR al personal que te esté atendiendo para que pueda
					otorgarte los puntos correspondientes a tu compra.
				</Text>
			</View>
		</AppLayout>
	);
}

import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

export default function ShowQRScreen() {
	return (
		<AppLayout headerVariant="default" showNavBar={true}>
			<Text>Mostrar QR - Por implementar</Text>
			{/* Aquí se mostrará el QR único del cliente para ser escaneado por el negocio */}
		</AppLayout>
	);
}

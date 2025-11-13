import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

export default function NotificationsScreen() {
	return (
		<AppLayout headerVariant="back" centerContent>
			<Text className="text-center text-typography-900 text-2xl font-bold">
				Notificaciones
			</Text>
			<Text className="text-center text-typography-500 text-base">
				Aquí se implementará el sistema de notificaciones
			</Text>
		</AppLayout>
	);
}

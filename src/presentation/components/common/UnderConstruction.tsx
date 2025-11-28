import { useRouter } from "expo-router";
import { Wrench } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

type Props = {
	onClose?: () => void;
	title?: string;
};

export default function UnderConstruction({ onClose, title }: Props) {
	const router = useRouter();
	const handleClose = () => {
		if (onClose) return onClose();
		return router.back();
	};

	return (
		<AppLayout headerVariant="back" headerTitle={title ?? "En construcción"}>
			<VStack className="flex-1 min-h-screen flex-col justify-center items-center">
				<Icon as={Wrench} size="6xl" className="text-yellow-500 mb-4" />
				<Heading size="lg" className="text-center mb-2">
					{title ?? "En construcción"}
				</Heading>
				<Text className="text-center text-typography-500 mb-6">
					Esta sección está en desarrollo y estará disponible próximamente.
				</Text>
				<Button onPress={handleClose} className="bg-primary-600 px-6">
					<ButtonText>Volver</ButtonText>
				</Button>
			</VStack>
		</AppLayout>
	);
}

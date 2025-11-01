import { ActivityIndicator } from "react-native";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface AuthLoadingProps {
	message?: string;
}

/**
 * Componente de carga para estados de autenticación.
 * Muestra un spinner y un mensaje mientras se verifica la sesión.
 */
export function AuthLoading({
	message = "Verificando sesión...",
}: AuthLoadingProps) {
	return (
		<Center className="flex-1 bg-background-0">
			<VStack space="md" className="items-center">
				<ActivityIndicator size="large" color="#3B82F6" />
				<Text className="text-typography-500">{message}</Text>
			</VStack>
		</Center>
	);
}

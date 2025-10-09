// Pantalla de Login (View en el patrón MVVM).
// Es un componente "tonto" que usa el hook 'useAuth' (ViewModel).
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/src/presentation/hooks/useAuth";
export const LoginScreen = () => {
	const { handleLogin } = useAuth();

	return (
		<Box className="flex-1 items-center justify-center bg-white p-4">
			<Button
				action={"primary"}
				variant={"solid"}
				size={"md"}
				isDisabled={false}
				onPress={() => handleLogin("test@example.com")}
			>
				<ButtonText>Login Screen</ButtonText>
			</Button>
		</Box>
	);
};

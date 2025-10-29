import { Stack } from "expo-router";
import { AuthGuard } from "@/src/presentation/components/auth/AuthGuard";

export default function PublicLayout() {
	return (
		<AuthGuard requireAuth={false}>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			>
				<Stack.Screen name="welcome" />
				<Stack.Screen name="login" />
				<Stack.Screen name="register" />
			</Stack>
		</AuthGuard>
	);
}

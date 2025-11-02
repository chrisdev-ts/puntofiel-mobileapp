import { Stack } from "expo-router";

export default function PublicLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="login" />
			<Stack.Screen name="register" />
			<Stack.Screen name="ownerterms" />
			<Stack.Screen name="userterms" />
		</Stack>
	);
}

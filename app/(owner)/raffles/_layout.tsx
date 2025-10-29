import { Stack } from "expo-router";

export default function RafflesLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="[id]" />
			<Stack.Screen name="create" />
			<Stack.Screen name="edit" />
		</Stack>
	);
}

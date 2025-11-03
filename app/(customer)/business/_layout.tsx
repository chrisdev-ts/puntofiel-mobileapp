import { Stack } from "expo-router";

export default function BusinessLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="[id]" />
			<Stack.Screen name="search" />
		</Stack>
	);
}

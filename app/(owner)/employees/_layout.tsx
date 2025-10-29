import { Stack } from "expo-router";

export default function EmployeesLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="[id]" />
			<Stack.Screen name="create" />
			<Stack.Screen name="edit" />
		</Stack>
	);
}

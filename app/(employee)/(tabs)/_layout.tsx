import { Stack } from "expo-router";

/**
 * Layout para las pantallas de tabs del empleado
 * No se usa Tabs nativo de Expo, sino NavBar personalizada
 */
export default function EmployeeTabsLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="scan-qr" />
			<Stack.Screen name="profile" />
		</Stack>
	);
}

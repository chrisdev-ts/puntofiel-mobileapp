// app/(owner)/raffles/_layout.tsx
import { Stack } from "expo-router";

export default function RafflesLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* La lista principal */}
			<Stack.Screen name="index" />

			{/* Pantalla de creación */}
			<Stack.Screen name="create" />

			{/* Pantalla de edición (dinámica por ID) */}
			<Stack.Screen name="[id]" />
		</Stack>
	);
}
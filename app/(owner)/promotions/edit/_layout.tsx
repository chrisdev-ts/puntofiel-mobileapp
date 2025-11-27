import { Stack } from "expo-router";

export default function EditLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="[id]"
				options={{
					title: "Editar Promoción",
				}}
			/>
		</Stack>
	);
}

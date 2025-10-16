import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";

export const LoginScreen = () => {
	const [telefono, setTelefono] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = () => {
		console.log("Iniciando el proceso de login");
		if (!telefono || !password) {
			alert("Por favor, ingrese todos los campos");
		} else {
			alert(
				`Iniciando sesión con Teléfono: ${telefono} y Contraseña: ${password}`,
			);
		}
	};

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps="handled"
		>
			<Box className="flex-1 items-center justify-center bg-white px-8 gap-4 py-6">
				<Heading size="2xl">Iniciar sesión</Heading>
				<Text className="text-center">Acceda a su billetera de puntos</Text>

				{/* Campo para número de teléfono */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText>Número de teléfono</FormControlLabelText>
					<Input>
						<InputField
							placeholder="Ingrese su número de teléfono"
							keyboardType="phone-pad"
							onChangeText={setTelefono}
							value={telefono}
						/>
					</Input>
				</FormControl>

				{/* Campo para contraseña */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText>Contraseña</FormControlLabelText>
					<Input>
						<InputField
							placeholder="Ingrese su contraseña"
							secureTextEntry
							onChangeText={setPassword}
							value={password}
						/>
					</Input>
				</FormControl>

				<FormControl className="w-full">
					<Button variant="solid" action="primary" onPress={handleLogin}>
						<ButtonText>Iniciar sesión</ButtonText>
					</Button>
				</FormControl>

				<FormControl>
					<HStack>
						<Text size="lg">¿No tiene cuenta?&nbsp;</Text>
						<Link onPress={() => router.push("/register")}>
							<HStack>
								<LinkText size="lg">Regístrese</LinkText>
							</HStack>
						</Link>
					</HStack>
				</FormControl>
			</Box>
		</ScrollView>
	);
};

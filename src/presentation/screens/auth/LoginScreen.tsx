import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
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
import { IS_DEV_MODE } from "@/src/infrastructure/config/dev";
import { useAuth } from "@/src/presentation/hooks/useAuth";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { handleLogin, refresh } = useAuth();

	const onLoginPress = async () => {
		if (IS_DEV_MODE) {
			// En modo desarrollo, solo refrescar el usuario mock
			setLoading(true);
			try {
				await refresh();
				// El redirect se manejará automáticamente en app/index.tsx
				router.replace("/");
			} catch (_error) {
				Alert.alert("Error", "No se pudo cargar el usuario de prueba");
			} finally {
				setLoading(false);
			}
			return;
		}

		// En producción, validar y autenticar
		if (!email || !password) {
			Alert.alert("Error", "Por favor, ingrese todos los campos");
			return;
		}

		setLoading(true);
		const result = await handleLogin(email, password);
		setLoading(false);

		if (result.success) {
			// El redirect se manejará automáticamente en app/index.tsx
			router.replace("/");
		} else {
			Alert.alert(
				"Error de inicio de sesión",
				"Email o contraseña incorrectos",
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
				<Text className="text-center">
					{IS_DEV_MODE
						? "Modo desarrollo - Presiona 'Iniciar sesión' para continuar"
						: "Acceda a su billetera de puntos"}
				</Text>

				{/* Mostrar campos solo en producción */}
				{!IS_DEV_MODE && (
					<>
						{/* Campo para email */}
						<FormControl className="w-full gap-2">
							<FormControlLabelText>Email</FormControlLabelText>
							<Input>
								<InputField
									placeholder="Ingrese su email"
									keyboardType="email-address"
									autoCapitalize="none"
									onChangeText={setEmail}
									value={email}
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
					</>
				)}

				<FormControl className="w-full">
					<Button
						variant="solid"
						action="primary"
						onPress={onLoginPress}
						isDisabled={loading}
					>
						<ButtonText>
							{loading ? "Cargando..." : "Iniciar sesión"}
						</ButtonText>
					</Button>
				</FormControl>

				<FormControl>
					<HStack>
						<Text size="lg">¿No tiene cuenta?&nbsp;</Text>
						<Link onPress={() => router.push("/(public)/register")}>
							<HStack>
								<LinkText size="lg">Regístrese</LinkText>
							</HStack>
						</Link>
					</HStack>
				</FormControl>
			</Box>
		</ScrollView>
	);
}

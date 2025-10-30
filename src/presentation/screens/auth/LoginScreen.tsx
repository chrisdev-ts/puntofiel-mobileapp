import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { type LoginFormData, loginSchema } from "./LoginSchema";

export function LoginScreen() {
	const router = useRouter();
	const { login, isLoggingIn, loginError } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	});

	const onSubmit: SubmitHandler<LoginFormData> = (data) => {
		console.log("Enviando credenciales de login:", { email: data.email });

		login(
			{
				email: data.email,
				password: data.password,
			},
			{
				onSuccess: (user) => {
					console.log("Login exitoso, usuario:", user);
					Alert.alert(
						"¡Bienvenido!",
						`Hola ${user.firstName}, has iniciado sesión correctamente.`,
						[
							{
								text: "Continuar",
								onPress: () => {
									// Redirigir según el rol del usuario
									if (user.role === "business_owner") {
										router.replace("/"); // Pantalla para negocios  ruta:business
									} else {
										router.replace("/"); // Pantalla para clientes ruta:customer
									}
								},
							},
						],
					);
				},
				onError: (error) => {
					console.error("Error en el login:", error);

					// Manejo especial para email no verificado
					if (error.message.includes("verificar tu correo")) {
						Alert.alert(
							"Email no verificado",
							"Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
							[
								{ text: "Entendido" },
								{
									text: "¿Reenviar email?",
									onPress: () => {
										// TODO: Implementar reenvío de email de verificación
										Alert.alert(
											"Función en desarrollo",
											"Próximamente podrás reenviar el email de verificación.",
										);
									},
								},
							],
						);
					} else {
						Alert.alert(
							"Error al iniciar sesión",
							error.message ||
								"Ocurrió un error. Verifica tus credenciales e intenta nuevamente.",
						);
					}
				},
			},
		);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "android" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "android" ? 0 : 20}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<Box className="flex-1 items-center justify-center bg-white px-6 gap-6 py-8">
					<Image
						source={require("@/assets/logos/logo-horizontal-dark.png")}
						className="w-56 h-20"
						resizeMode="contain"
						alt="Logo Punto Fiel"
					/>

					<VStack space="sm" className="items-center">
						<Heading size="2xl" className="text-center">
							Iniciar Sesión
						</Heading>
						<Text size="md" className="text-center text-gray-600 px-4">
							Acceda a su billetera de puntos y recompensas
						</Text>
					</VStack>

					{/* Email */}
					<FormControl isInvalid={!!errors.email} className="w-full gap-2">
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Correo Electrónico *
						</Text>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="correo@ejemplo.com"
										keyboardType="email-address"
										autoCapitalize="none"
										autoCorrect={false}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										style={{ fontSize: 16 }}
									/>
								</Input>
							)}
						/>
						{errors.email && (
							<FormControlErrorText>
								{errors.email.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Contraseña */}
					<FormControl isInvalid={!!errors.password} className="w-full gap-2">
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Contraseña *
						</Text>
						<Controller
							control={control}
							name="password"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="Tu contraseña"
										secureTextEntry
										autoCapitalize="none"
										autoCorrect={false}
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										style={{ fontSize: 16 }}
									/>
								</Input>
							)}
						/>
						{errors.password && (
							<FormControlErrorText>
								{errors.password.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Error del servidor */}
					{loginError && (
						<Box
							style={{
								padding: 12,
								backgroundColor: "#fee",
								borderRadius: 8,
								width: "100%",
							}}
						>
							<Text style={{ color: "#c00", fontSize: 14 }}>
								{loginError.message}
							</Text>
						</Box>
					)}

					{/* Botón de login */}
					<Button
						onPress={handleSubmit(onSubmit)}
						isDisabled={isLoggingIn}
						style={{
							marginTop: 16,
							width: "100%",
							backgroundColor: isLoggingIn ? "#888" : "#2f4858",
							minHeight: 50,
						}}
					>
						<ButtonText style={{ fontSize: 16, fontWeight: "600" }}>
							{isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
						</ButtonText>
					</Button>

					{/* Link a registro */}
					<HStack space="xs" className="items-center">
						<Text size="md">¿No tiene cuenta?</Text>
						<Link onPress={() => router.push("/(public)/register")}>
							<LinkText
								size="md"
								style={{ fontWeight: "600", textDecorationLine: "underline" }}
							>
								Regístrese
							</LinkText>
						</Link>
					</HStack>

					{/* Link a recuperar contraseña (opcional) */}
					<Button
						variant="link"
						onPress={() =>
							Alert.alert(
								"Función en desarrollo",
								"Próximamente podrás recuperar tu contraseña.",
							)
						}
					>
						<ButtonText style={{ fontSize: 14, color: "#666" }}>
							¿Olvidaste tu contraseña?
						</ButtonText>
					</Button>
				</Box>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { Alert } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { type LoginFormData, loginSchema } from "./LoginSchema";

export function LoginScreen() {
	const router = useRouter();
	const { login, isLoggingIn, loginError } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

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

					// Redirigir según el rol del usuario
					let redirectPath = "";

					switch (user.role) {
						case "owner":
							redirectPath = "/(owner)/(tabs)/home";
							break;
						case "employee":
							redirectPath = "/(employee)/(tabs)/scan";
							break;
						case "customer":
							redirectPath = "/(customer)/(tabs)/home";
							break;
						default:
							console.error("Rol desconocido:", user.role);
							Alert.alert("Error", "Rol de usuario no reconocido.");
							return;
					}

					console.log("Redirigiendo a:", redirectPath);
					router.replace(redirectPath as never);
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
		<AppLayout
			showHeader={true}
			showNavBar={false}
			headerTitle="Iniciar sesión"
			headerVariant="back"
			backgroundColor="bg-white"
			contentSpacing="md"
			centerContent={true}
			avoidKeyboard={true}
		>
			<Image
				source={require("@/assets/logos/logo-horizontal-dark.png")}
				className="w-56 h-20 self-center"
				resizeMode="contain"
				alt="Logo Punto Fiel"
			/>

			<Heading size="2xl" className="text-center">
				Iniciar sesión
			</Heading>
			<Text size="md" className="text-center text-gray-600">
				Acceda a su billetera de puntos y recompensas
			</Text>

			{/* Email */}
			<FormControl isInvalid={!!errors.email} className="w-full gap-2 mt-4">
				<Text size="sm" className="mb-2 font-semibold">
					Correo electrónico *
				</Text>
				<Controller
					control={control}
					name="email"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Ingresa tu correo"
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className="text-base"
							/>
						</Input>
					)}
				/>
				{errors.email && (
					<FormControlErrorText>{errors.email.message}</FormControlErrorText>
				)}
			</FormControl>

			{/* Contraseña */}
			<FormControl isInvalid={!!errors.password} className="w-full gap-2 mt-4">
				<Text size="sm" className="mb-2 font-semibold">
					Contraseña *
				</Text>
				<Controller
					control={control}
					name="password"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Ingresa tu contraseña"
								type={showPassword ? "text" : "password"}
								autoCapitalize="none"
								autoCorrect={false}
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className="text-base"
							/>
							<InputSlot
								className="pr-3"
								onPress={() => setShowPassword(!showPassword)}
							>
								<InputIcon as={showPassword ? Eye : EyeOff} />
							</InputSlot>
						</Input>
					)}
				/>
				{errors.password && (
					<FormControlErrorText>{errors.password.message}</FormControlErrorText>
				)}
			</FormControl>

			{/* Error del servidor */}
			{loginError && (
				<Text className="text-red-700 bg-red-100 p-3 rounded-lg w-full text-center">
					{loginError.message}
				</Text>
			)}

			{/* Botón de login */}
			<Button
				onPress={handleSubmit(onSubmit)}
				isDisabled={isLoggingIn}
				className="w-full mt-4"
				size="lg"
			>
				<ButtonText className="text-base font-semibold">
					{isLoggingIn ? "Iniciando sesión..." : "Iniciar sesión"}
				</ButtonText>
			</Button>

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
				<ButtonText className="text-sm text-gray-600">
					¿Olvidaste tu contraseña?
				</ButtonText>
			</Button>
		</AppLayout>
	);
}

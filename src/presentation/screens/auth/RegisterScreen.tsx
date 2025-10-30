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
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	Checkbox,
	CheckboxIcon,
	CheckboxIndicator,
	CheckboxLabel,
} from "@/components/ui/checkbox";
import {
	FormControl,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CheckIcon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import {
	cleanPhoneNumber,
	formatPhoneNumber,
	type RegisterFormData,
	registerSchema,
} from "./RegisterSchema";

export function RegisterScreen() {
	const router = useRouter();
	const { register, isRegistering, registerError } = useAuth();

	// Estado local para el switch de dueño de negocio
	//const [isBusinessOwner, setIsBusinessOwner] = useState(false);

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			secondLastName: "",
			email: "",
			phone: "",
			password: "",
			confirmPassword: "",
			isBusinessOwner: false,
			acceptTerms: false,
		},
		mode: "onChange",
	});
	const isBusinessOwner = watch("isBusinessOwner");
	const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
		// Mapear datos del formulario al DTO esperado por el useCase
		/*const userData = {
      firstName: data.firstName,
      lastName: data.lastName || undefined,
      secondLastName: data.secondLastName || undefined,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.isBusinessOwner ? 'business_owner' : 'customer',
    };*/

		const isBusinessOwner = watch("isBusinessOwner");

		console.log("Datos del formulario:", data);

		//Función helper para limpiar strings opcionales
		const cleanOptionalString = (
			value: string | undefined,
		): string | undefined => {
			if (!value || value.trim() === "") return undefined;
			return value.trim();
		};

		register(
			{
				firstName: data.firstName.trim(),
				lastName: data.lastName.trim(),
				secondLastName: cleanOptionalString(data.secondLastName), // ✅ Convertir string vacío a undefined
				email: data.email.trim().toLowerCase(),
				phone: cleanPhoneNumber(data.phone),
				password: data.password,
				role: data.isBusinessOwner ? "business_owner" : "customer",
			},
			{
				onSuccess: (user) => {
					console.log("Registro exitoso, usuario:", user);
					Alert.alert(
						"¡Cuenta creada exitosamente!",
						"Te hemos enviado un correo de verificación.\n\nPor favor:\n1. Revisa tu bandeja de entrada\n2. Haz clic en el enlace de verificación\n3. Regresa aquí para iniciar sesión",
						[
							{
								text: "Ir a Iniciar Sesión",
								onPress: () => router.replace("/(public)/login"),
							},
						],
					);
				},
				onError: (error) => {
					console.error("Error en el registro:", error);
					Alert.alert(
						"Error al registrarse",
						error.message || "Ocurrió un error. Intenta nuevamente.",
					);
				},
			},
		);
	};

	const handleBusinessOwnerChange = (value: boolean) => {
		//setIsBusinessOwner(value);
		setValue("isBusinessOwner", value);
		// Resetear términos cuando cambia el tipo de usuario
		setValue("acceptTerms", false);
	};

	const handleTermsPress = () => {
		if (isBusinessOwner) {
			router.push("/(public)/register"); //terms-business
		} else {
			router.push("/(public)/login"); //terms-customer
		}
	};

	const handlePhoneChange = (
		value: string,
		onChange: (value: string) => void,
	) => {
		const formattedValue = formatPhoneNumber(value);
		onChange(formattedValue);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "android" ? "padding" : "height"}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === "android" ? 0 : 20}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
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
							Crear cuenta
						</Heading>
						<Text size="md" className="text-center text-gray-600 px-4">
							Regístrese para gestionar sus puntos y recompensas
						</Text>
					</VStack>

					{/* Nombres */}
					<FormControl isInvalid={!!errors.firstName} className="w-full gap-2">
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Nombre/s *
						</Text>
						<Controller
							control={control}
							name="firstName"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="Nombres/s"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										style={{ fontSize: 16 }}
									/>
								</Input>
							)}
						/>
						{errors.firstName && (
							<FormControlErrorText>
								{errors.firstName.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Apellido Paterno */}
					<FormControl isInvalid={!!errors.lastName} className="w-full gap-2">
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Apellido Paterno *
						</Text>
						<Controller
							control={control}
							name="lastName"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="Apellido paterno"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										style={{ fontSize: 16 }}
									/>
								</Input>
							)}
						/>
						{errors.lastName && (
							<FormControlErrorText>
								{errors.lastName.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Apellido Materno */}
					<FormControl
						isInvalid={!!errors.secondLastName}
						className="w-full gap-2"
					>
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Apellido Materno
						</Text>
						<Controller
							control={control}
							name="secondLastName"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="Apellido materno (opcional)"
										onBlur={onBlur}
										onChangeText={onChange}
										value={value}
										style={{ fontSize: 16 }}
									/>
								</Input>
							)}
						/>
						{errors.secondLastName && (
							<FormControlErrorText>
								{errors.secondLastName.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Correo Electrónico */}
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

					{/* Número de Teléfono */}
					<FormControl isInvalid={!!errors.phone} className="w-full gap-2">
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Número de Teléfono *
						</Text>
						<Controller
							control={control}
							name="phone"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="XXX-XXX-XXXX"
										keyboardType="phone-pad"
										onBlur={onBlur}
										onChangeText={(value) => handlePhoneChange(value, onChange)}
										value={value}
										style={{ fontSize: 16 }}
										maxLength={12}
									/>
								</Input>
							)}
						/>
						{errors.phone && (
							<FormControlErrorText>
								{errors.phone.message}
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
										placeholder="Mínimo 8 caracteres"
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

					{/* Confirmar Contraseña */}
					<FormControl
						isInvalid={!!errors.confirmPassword}
						className="w-full gap-2"
					>
						<Text size="sm" style={{ marginBottom: 4, fontWeight: "600" }}>
							Confirmar Contraseña *
						</Text>
						<Controller
							control={control}
							name="confirmPassword"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input size="lg" className="min-h-[48px]">
									<InputField
										placeholder="Confirmar contraseña"
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
						{errors.confirmPassword && (
							<FormControlErrorText>
								{errors.confirmPassword.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Switch para dueño de negocio */}
					<FormControl
						className="w-full gap-2"
						style={{ alignItems: "flex-start", marginTop: 8 }}
					>
						<HStack space="md" className="items-center">
							<Controller
								control={control}
								name="isBusinessOwner"
								render={({ field: { value } }) => (
									<Switch
										value={value}
										onValueChange={handleBusinessOwnerChange}
										trackColor={{ false: "#d4d4d4", true: "#2f4858" }}
										thumbColor="#ffffff"
									/>
								)}
							/>
							<Text size="md" style={{ fontWeight: "500" }}>
								Soy dueño de un negocio
							</Text>
						</HStack>
					</FormControl>

					{/* Checkbox para términos y condiciones */}
					<FormControl
						isInvalid={!!errors.acceptTerms}
						className="w-full gap-2"
						style={{ alignItems: "flex-start", marginTop: 8 }}
					>
						<Controller
							control={control}
							name="acceptTerms"
							render={({ field: { value, onChange } }) => (
								<Checkbox
									value="terms"
									isChecked={value}
									onChange={onChange}
									size="md"
									style={{ marginBottom: 10 }}
								>
									<CheckboxIndicator>
										<CheckboxIcon as={CheckIcon} />
									</CheckboxIndicator>
									<CheckboxLabel style={{ flex: 1, flexWrap: "wrap" }}>
										<Text size="sm">
											He leído y acepto los{" "}
											<Link onPress={handleTermsPress}>
												<LinkText
													size="sm"
													style={{
														fontWeight: "700",
														textDecorationLine: "underline",
														color: "#000000ff",
													}}
												>
													{isBusinessOwner
														? "Términos y condiciones para comercios"
														: "Términos y condiciones"}
												</LinkText>
											</Link>
										</Text>
									</CheckboxLabel>
								</Checkbox>
							)}
						/>
						{errors.acceptTerms && (
							<FormControlErrorText>
								{errors.acceptTerms.message}
							</FormControlErrorText>
						)}
					</FormControl>

					{/* Error del servidor */}
					{registerError && (
						<Box
							style={{
								padding: 12,
								backgroundColor: "#fee",
								borderRadius: 8,
								width: "100%",
							}}
						>
							<Text style={{ color: "#c00", fontSize: 14 }}>
								{registerError.message}
							</Text>
						</Box>
					)}

					{/* Botón de registro */}
					<Button
						onPress={handleSubmit(onSubmit)}
						isDisabled={isRegistering}
						style={{
							marginTop: 16,
							width: "100%",
							backgroundColor: isRegistering ? "#888" : "#2f4858",
							minHeight: 50,
						}}
					>
						<ButtonText style={{ fontSize: 16, fontWeight: "600" }}>
							{isRegistering ? "Registrando..." : "Crear cuenta"}
						</ButtonText>
					</Button>

					{/* Link a login */}
					<HStack space="xs" className="items-center">
						<Text size="md">¿Ya tiene cuenta?</Text>
						<Link onPress={() => router.push("/(public)/login")}>
							<LinkText
								size="md"
								style={{ fontWeight: "600", textDecorationLine: "underline" }}
							>
								Inicie sesión
							</LinkText>
						</Link>
					</HStack>
				</Box>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

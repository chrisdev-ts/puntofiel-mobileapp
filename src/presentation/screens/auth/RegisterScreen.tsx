import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
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
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { AppLayout } from "@/src/presentation/components/layout";
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
	const toast = useToast();

	// Estados para mostrar/ocultar contraseñas
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      role: data.isBusinessOwner ? 'owner' : 'customer',
    };*/

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
				secondLastName: cleanOptionalString(data.secondLastName),
				email: data.email.trim().toLowerCase(),
				phone: data.phone ? cleanPhoneNumber(data.phone) : undefined,
				password: data.password,
				role: data.isBusinessOwner ? "owner" : "customer",
			},
			{
				onSuccess: (user) => {
					console.log("Registro exitoso, usuario:", user);
					toast.show({
						placement: "top",
						duration: 5000,
						render: ({ id }) => {
							const uniqueToastId = `toast-${id}`;
							return (
								<Toast
									nativeID={uniqueToastId}
									action="success"
									variant="solid"
								>
									<ToastTitle>¡Registro exitoso!</ToastTitle>
									<ToastDescription>
										Te hemos enviado un correo de verificación. Por favor revisa
										tu bandeja de entrada.
									</ToastDescription>
								</Toast>
							);
						},
					});
					setTimeout(() => {
						router.replace("/(public)/login");
					}, 1000);
				},
				onError: (error) => {
					console.error("Error en el registro:", error);
					toast.show({
						placement: "top",
						duration: 4000,
						render: ({ id }) => {
							const uniqueToastId = `toast-${id}`;
							return (
								<Toast nativeID={uniqueToastId} action="error" variant="solid">
									<ToastTitle>Error al registrarse</ToastTitle>
									<ToastDescription>
										{error.message || "Ocurrió un error. Intenta nuevamente."}
									</ToastDescription>
								</Toast>
							);
						},
					});
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
		const termType = isBusinessOwner ? "owner" : "user";
		router.push(`/(public)/terms/${termType}`);
	};

	const handlePhoneChange = (
		value: string,
		onChange: (value: string) => void,
	) => {
		const formattedValue = formatPhoneNumber(value);
		onChange(formattedValue);
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			headerTitle="Crear cuenta"
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
				Crear cuenta
			</Heading>
			<Text size="md" className="text-center text-gray-600">
				Regístrese para gestionar sus puntos y recompensas
			</Text>
			{/* Nombres */}
			<FormControl isInvalid={!!errors.firstName} className="w-full gap-2 mt-4">
				<Text size="sm" className="mb-2 font-semibold">
					Nombre/s *
				</Text>
				<Controller
					control={control}
					name="firstName"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Ingresa tu/s nombre/s"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className="text-base"
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
			<FormControl isInvalid={!!errors.lastName} className="w-full gap-2 mt-4">
				<Text size="sm" className="mb-2 font-semibold">
					Apellido paterno *
				</Text>
				<Controller
					control={control}
					name="lastName"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Ingresa tu apellido paterno"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className="text-base"
							/>
						</Input>
					)}
				/>
				{errors.lastName && (
					<FormControlErrorText>{errors.lastName.message}</FormControlErrorText>
				)}
			</FormControl>
			{/* Apellido Materno */}
			<FormControl
				isInvalid={!!errors.secondLastName}
				className="w-full gap-2 mt-4"
			>
				<Text size="sm" className="mb-2 font-semibold">
					Apellido materno (opcional)
				</Text>
				<Controller
					control={control}
					name="secondLastName"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Ingresa tu apellido materno"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className="text-base"
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
								placeholder="Ingresa tu correo electrónico"
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
			{/* Número de Teléfono */}
			<FormControl isInvalid={!!errors.phone} className="w-full gap-2 mt-4">
				<Text size="sm" className="mb-2 font-semibold">
					Número de teléfono (opcional)
				</Text>
				<Controller
					control={control}
					name="phone"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Ej: 555-123-4567"
								keyboardType="phone-pad"
								onBlur={onBlur}
								onChangeText={(value) => handlePhoneChange(value, onChange)}
								value={value}
								className="text-base"
								maxLength={12}
							/>
						</Input>
					)}
				/>
				{errors.phone && (
					<FormControlErrorText>{errors.phone.message}</FormControlErrorText>
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
								placeholder="Crea una contraseña segura"
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
			{/* Confirmar Contraseña */}
			<FormControl
				isInvalid={!!errors.confirmPassword}
				className="w-full gap-2 mt-4"
			>
				<Text size="sm" className="mb-2 font-semibold">
					Confirmar contraseña *
				</Text>
				<Controller
					control={control}
					name="confirmPassword"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input size="lg" className="min-h-[48px]">
							<InputField
								placeholder="Vuelve a escribir tu contraseña"
								type={showConfirmPassword ? "text" : "password"}
								autoCapitalize="none"
								autoCorrect={false}
								onBlur={onBlur}
								onChangeText={onChange}
								value={value}
								className="text-base"
							/>
							<InputSlot
								className="pr-3"
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								<InputIcon as={showConfirmPassword ? Eye : EyeOff} />
							</InputSlot>
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
			<FormControl className="w-full gap-2 items-start mt-2">
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
					<Text size="md" className="font-medium">
						Soy dueño de un negocio
					</Text>
				</HStack>
			</FormControl>
			{/* Checkbox para términos y condiciones */}
			<FormControl
				isInvalid={!!errors.acceptTerms}
				className="w-full gap-2 items-start mt-2"
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
							className="mb-2"
						>
							<CheckboxIndicator>
								<CheckboxIcon as={CheckIcon} />
							</CheckboxIndicator>
							<CheckboxLabel>
									<Text size="sm" className="leading-5">
										He leído y acepto los{" "}
										<Text
											size="sm"
											className="font-bold underline text-primary-600 leading-5"
											onPress={handleTermsPress}
											// Estas props hacen que el Text se comporte como un link
											accessible={true}
											accessibilityRole="link"
										>
											{isBusinessOwner
												? "Términos y condiciones para comercios"
												: "Términos y condiciones"}
										</Text>
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
				<Text className="text-red-700 bg-red-100 p-3 rounded-lg w-full text-center">
					{registerError.message}
				</Text>
			)}
			{/* Botón de registro */}
			<Button
				onPress={handleSubmit(onSubmit)}
				isDisabled={isRegistering}
				className="w-full mt-4"
				size="lg"
			>
				<ButtonText className="text-base font-semibold">
					{isRegistering ? "Registrando..." : "Crear cuenta"}
				</ButtonText>
			</Button>
		</AppLayout>
	);
}

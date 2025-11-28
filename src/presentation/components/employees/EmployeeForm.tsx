import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import React, { forwardRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { type EmployeeFormData, EmployeeSchema } from "./EmployeeSchema";

/**
 * Props del componente EmployeeForm
 */
interface EmployeeFormProps {
	/** Función que se ejecuta al enviar el formulario */
	onSubmit: (data: EmployeeFormData) => void;
	/** Indica si el formulario está en proceso de envío */
	isLoading?: boolean;
	/** Datos iniciales del empleado (para modo edición) */
	initialData?: Partial<EmployeeFormData>;
	/** Modo del formulario: 'create' o 'edit' */
	mode?: "create" | "edit";
}

/**
 * Formulario para crear o editar un empleado
 */
import type { ForwardedRef } from "react";
// ...existing code...
export const EmployeeForm = forwardRef<
	ForwardedRef<HTMLFormElement>,
	EmployeeFormProps
>(({ onSubmit, isLoading = false, initialData, mode = "create" }, ref) => {
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

	const isEditMode = mode === "edit";

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<EmployeeFormData>({
		resolver: zodResolver(EmployeeSchema),
		defaultValues: initialData || {
			firstName: "",
			lastName: "",
			secondLastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const submitButtonText = isLoading
		? isEditMode
			? "Guardando cambios..."
			: "Creando cuenta..."
		: isEditMode
			? "Guardar cambios"
			: "Registrar empleado";

	return (
		<VStack space="lg" className="w-full" ref={ref}>
			{/* Nombre/s */}
			<FormControl isInvalid={!!errors.firstName} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Nombre/s</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="firstName"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Nombre/s"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								autoCapitalize="words"
								editable={!isLoading}
							/>
						</Input>
					)}
				/>
				{errors.firstName && (
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText>
							{errors.firstName.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			{/* Apellido paterno */}
			<FormControl isInvalid={!!errors.lastName} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Apellido paterno</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="lastName"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Apellido paterno"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								autoCapitalize="words"
								editable={!isLoading}
							/>
						</Input>
					)}
				/>
				{errors.lastName && (
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText>
							{errors.lastName.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			{/* Apellido materno */}
			<FormControl isInvalid={!!errors.secondLastName}>
				<FormControlLabel>
					<FormControlLabelText>Apellido materno</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="secondLastName"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Apellido materno"
								value={value || ""}
								onChangeText={onChange}
								onBlur={onBlur}
								autoCapitalize="words"
								editable={!isLoading}
							/>
						</Input>
					)}
				/>
				{errors.secondLastName && (
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText>
							{errors.secondLastName.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			{/* Correo electrónico */}
			<FormControl isInvalid={!!errors.email} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Correo electrónico</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="email"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Correo electrónico"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								keyboardType="email-address"
								autoCapitalize="none"
								editable={!isLoading}
							/>
						</Input>
					)}
				/>
				{errors.email && (
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText>{errors.email.message}</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			{/* Contraseña */}
			<FormControl isInvalid={!!errors.password} isRequired={!isEditMode}>
				<FormControlLabel>
					<FormControlLabelText>
						{isEditMode ? "Nueva contraseña (opcional)" : "Contraseña"}
					</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="password"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder={
									isEditMode ? "Dejar vacío para no cambiar" : "••••••••"
								}
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								secureTextEntry={!showPassword}
								editable={!isLoading}
							/>
							<InputSlot
								className="pr-3"
								onPress={() => setShowPassword(!showPassword)}
							>
								<InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
							</InputSlot>
						</Input>
					)}
				/>
				{isEditMode && !errors.password && (
					<Text className="text-typography-500 text-sm mt-1">
						Dejar vacío si no deseas cambiar la contraseña
					</Text>
				)}
				{errors.password && (
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText>
							{errors.password.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			{/* Confirmar contraseña */}
			<FormControl
				isInvalid={!!errors.confirmPassword}
				isRequired={!isEditMode}
			>
				<FormControlLabel>
					<FormControlLabelText>Confirmar contraseña</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="confirmPassword"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="••••••••"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								secureTextEntry={!showConfirmPassword}
								editable={!isLoading}
							/>
							<InputSlot
								className="pr-3"
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								<InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
							</InputSlot>
						</Input>
					)}
				/>
				{errors.confirmPassword && (
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText>
							{errors.confirmPassword.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			{/* Botón de envío */}
			<Button
				onPress={handleSubmit(onSubmit)}
				isDisabled={isLoading}
				size="lg"
				className="mt-4"
			>
				<ButtonText>{submitButtonText}</ButtonText>
			</Button>
		</VStack>
	);
});

EmployeeForm.displayName = "EmployeeForm";

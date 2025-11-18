import { useState } from "react";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { User } from "@/src/core/entities/User";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

interface EditProfileScreenProps {
	userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};
	onCancel: () => void;
	onSave: () => void;
	updateProfileAsync: (data: Partial<User>) => Promise<User>;
}

/**
 * Pantalla de edición de perfil
 * Permite al usuario modificar su información personal
 */
export default function EditProfileScreen({
	userData,
	onCancel,
	onSave,
	updateProfileAsync,
}: EditProfileScreenProps) {
	const [firstName, setFirstName] = useState(userData.firstName);
	const [lastName, setLastName] = useState(userData.lastName);
	const [phone, setPhone] = useState(userData.phone);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		setIsSaving(true);
		setError(null);

		try {
			const dataToUpdate: Partial<User> = {
				firstName: firstName,
				lastName: lastName,
				phone: phone,
			};

			await updateProfileAsync(dataToUpdate);
			console.log("[EditProfileScreen] Datos guardados exitosamente.");
			onSave();
		} catch (err) {
			console.error("[EditProfileScreen] Error al actualizar el perfil:", err);
			const errorMessage =
				(err as Error)?.message || "Ocurrió un error al guardar los cambios.";
			setError(errorMessage);
			setIsSaving(false);
		}
	};

	return (
		<AppLayout
			headerVariant="back"
			headerTitle="Editar perfil"
			showNavBar={false}
			avoidKeyboard={true}
		>
			{error && (
				<Box className="p-3 bg-error-50 rounded-lg">
					<Text className="text-error-600 text-sm font-medium">
						Error: {error}
					</Text>
				</Box>
			)}

			<VStack className="gap-2">
				<Text className="text-typography-700 text-sm font-medium">Nombre</Text>
				<Input isDisabled={isSaving}>
					<InputField
						placeholder="Nombre(s)"
						value={firstName}
						onChangeText={setFirstName}
					/>
				</Input>
			</VStack>

			<VStack className="gap-2">
				<Text className="text-typography-700 text-sm font-medium">
					Apellido
				</Text>
				<Input isDisabled={isSaving}>
					<InputField
						placeholder="Apellido(s)"
						value={lastName}
						onChangeText={setLastName}
					/>
				</Input>
			</VStack>

			<VStack className="gap-2">
				<Text className="text-typography-700 text-sm font-medium">
					Correo electrónico
				</Text>
				<Input isDisabled={true}>
					<InputField
						placeholder="correo@ejemplo.com"
						value={userData.email}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</Input>
				<Text className="text-xs text-typography-500">
					El email solo puede ser cambiado desde la configuración de seguridad.
				</Text>
			</VStack>

			<VStack className="gap-2">
				<Text className="text-typography-700 text-sm font-medium">
					Teléfono
				</Text>
				<Input isDisabled={isSaving}>
					<InputField
						placeholder="+00 000-000-0000"
						value={phone}
						onChangeText={setPhone}
						keyboardType="phone-pad"
					/>
				</Input>
			</VStack>

			<Button size="md" onPress={handleSave} isDisabled={isSaving}>
				<ButtonText>{isSaving ? "Guardando..." : "Guardar cambios"}</ButtonText>
			</Button>
		</AppLayout>
	);
}

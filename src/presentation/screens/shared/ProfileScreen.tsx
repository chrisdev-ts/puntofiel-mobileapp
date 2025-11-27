import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
	BellIcon,
	CalendarDaysIcon,
	EditIcon,
	HelpCircleIcon,
	InfoIcon,
	LockIcon,
} from "@/components/ui/icon";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { MenuItem, MenuSection } from "@/src/presentation/components/profile";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useLoyalty } from "@/src/presentation/hooks/useLoyalty";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import EditProfileScreen from "./EditProfileScreen";

/**
 * Pantalla de perfil del usuario
 *
 * Responsabilidades (siguiendo Clean Architecture):
 * - Orquestar componentes de UI (ProfileHeader, MenuSections, ProfileActions)
 * - Gestionar estado local de UI (modales, modo edición)
 * - Delegar navegación al hook useProfileNavigation
 * - Delegar autenticación al hook useAuth
 */

export default function ProfileScreen() {
	const { user, logout, updateProfileAsync } = useAuth();

	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const goUnder = (label: string) => {
		console.log(`[ProfileScreen] navigate -> under-construction (${label})`);
		router.push("/under-construction");
	};

	// Hook para obtener tarjetas de lealtad y sumar puntos
	const { data: loyaltyCards, isLoading: isLoadingLoyalty } = useLoyalty();
	const currentBalance = loyaltyCards
		? loyaltyCards.reduce((acc, card) => acc + (card.points || 0), 0)
		: 0;

	// Datos del usuario con valores por defecto
	const userData = {
		firstName: user?.firstName ?? "Nombre de usuario",
		lastName: user?.lastName ?? "",
		email: user?.email ?? "correo.usuario@email.com",
		phone: user?.phone ?? "+00 000-000-0000",
		role: user?.role ?? "user",
		currentBalance,
	};

	const handleLogoutConfirm = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			setShowLogoutModal(false);
			// Opcional: router.replace('/(public)/login');
		} catch (error) {
			console.error("[ProfileScreen] Error al cerrar sesión:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	if (!user) {
		return (
			<AppLayout showHeader={false} showNavBar={false} centerContent>
				<Text className="text-center text-typography-500">
					No hay usuario autenticado
				</Text>
			</AppLayout>
		);
	}

	if (isEditing) {
		return (
			<EditProfileScreen
				userData={userData}
				onCancel={() => setIsEditing(false)}
				onSave={() => setIsEditing(false)}
				updateProfileAsync={updateProfileAsync}
			/>
		);
	}

	return (
		<AppLayout>
			{/* Header inline (React Native) */}
			<View className="items-center">
				<Text className="text-xl font-bold text-center">
					{userData.firstName} {userData.lastName}
				</Text>
				<Text className="text-base text-typography-500 text-center">
					{userData.email}
				</Text>
				<Text className="text-base text-typography-400 text-center">
					{userData.phone}
				</Text>
			</View>

			{/* Sección administración - Customer/User */}
			{(userData.role === "customer" || userData.role === "user") && (
				<MenuSection title="Administración">
					<MenuItem
						icon={CalendarDaysIcon}
						label="Saldo actual"
						value={
							isLoadingLoyalty
								? "Cargando..."
								: `${userData.currentBalance} puntos`
						}
					/>
					<MenuItem
						icon={EditIcon}
						label="Historial de movimientos"
						onPress={() => goUnder("Historial de movimientos")}
					/>
					<MenuItem
						icon={InfoIcon}
						label="Administrar locales vinculados"
						onPress={() => goUnder("Administrar locales vinculados")}
						showDivider={false}
					/>
				</MenuSection>
			)}

			{/* Sección administración - Owner */}
			{userData.role === "owner" && (
				<MenuSection title="Administración">
					<MenuItem
						icon={EditIcon}
						label="Gestionar empleados"
						onPress={() => router.push("/(owner)/employees")}
					/>
					<MenuItem
						icon={EditIcon}
						label="Clientes vinculados"
						onPress={() => goUnder("Clientes vinculados")}
					/>
					<MenuItem
						icon={CalendarDaysIcon}
						label="Historial de puntos otorgados"
						onPress={() => goUnder("Historial de puntos otorgados")}
					/>
					<MenuItem
						icon={CalendarDaysIcon}
						label="Historial de recompensas canjeadas"
						onPress={() => goUnder("Historial de recompensas canjeadas")}
						showDivider={false}
					/>
				</MenuSection>
			)}

			{/* Preferencias */}
			<MenuSection title="Preferencias">
				<MenuItem
					icon={BellIcon}
					label="Notificaciones"
					onPress={() => goUnder("Notificaciones")}
				/>
				<MenuItem
					icon={LockIcon}
					label="Seguridad"
					onPress={() => goUnder("Seguridad")}
					showDivider={false}
				/>
			</MenuSection>

			{/* Soporte */}
			<MenuSection title="Soporte">
				<MenuItem
					icon={HelpCircleIcon}
					label="Ayuda"
					onPress={() => goUnder("Ayuda")}
				/>
				<MenuItem
					icon={InfoIcon}
					label="Términos y condiciones"
					onPress={() => goUnder("Términos y condiciones")}
					showDivider={false}
				/>
			</MenuSection>

			{/* Acciones */}
			<VStack>
				<Button
					variant="solid"
					action="primary"
					className="mb-2"
					onPress={() => setIsEditing(true)}
				>
					<ButtonText>Editar perfil</ButtonText>
				</Button>
				<Button
					variant="solid"
					action="negative"
					className="mb-2"
					onPress={() => setShowLogoutModal(true)}
				>
					<ButtonText>Cerrar sesión</ButtonText>
				</Button>
			</VStack>

			{/* Modal de confirmación para cerrar sesión */}
			<Modal
				isOpen={showLogoutModal}
				onClose={() => setShowLogoutModal(false)}
				size="md"
			>
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>
						<Heading size="lg">Cerrar sesión</Heading>
						<ModalCloseButton />
					</ModalHeader>
					<ModalBody>
						<Text>¿Estás seguro de que deseas cerrar sesión?</Text>
					</ModalBody>
					<ModalFooter>
						<VStack className="gap-2 w-full">
							<Button
								variant="outline"
								action="secondary"
								onPress={() => setShowLogoutModal(false)}
								isDisabled={isLoggingOut}
							>
								<ButtonText>Cancelar</ButtonText>
							</Button>
							<Button
								action="negative"
								onPress={handleLogoutConfirm}
								isDisabled={isLoggingOut}
							>
								<ButtonText>
									{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
								</ButtonText>
							</Button>
						</VStack>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AppLayout>
	);
}

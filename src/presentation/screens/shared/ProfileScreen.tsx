import { router } from "expo-router";
import { useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
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
import { useAuth } from "@/src/presentation/hooks/useAuth";

export default function ProfileScreen() {
	const { user, logout } = useAuth();
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogoutConfirm = async () => {
		console.log("[ProfileScreen] Confirmado logout, ejecutando...");
		setIsLoggingOut(true);
		try {
			console.log("[ProfileScreen] Llamando a logout()...");
			await logout();
			console.log("[ProfileScreen] Logout exitoso");
			setShowLogoutModal(false);
			// No redirigir manualmente, el guard se encargará
		} catch (error) {
			console.error("[ProfileScreen] Error al cerrar sesión:", error);
			setIsLoggingOut(false);
		}
	};

	if (!user) {
		return (
			<AppLayout headerVariant="default">
				<Text className="text-center text-typography-500">
					No hay usuario autenticado
				</Text>
			</AppLayout>
		);
	}

	return (
		<AppLayout headerVariant="default" contentSpacing="xs">
			{/* TEMPORAL: Información básica del usuario */}
			<Text className="text-center text-typography-900 text-xl font-semibold">
				{user.firstName} {user.lastName}
			</Text>
			<Text className="text-center text-typography-500">{user.email}</Text>

			<VStack space="md" className="mt-6">
				{/* TEMPORAL: Botón de acceso a empleados solo para owners */}
				{user.role === "owner" && (
					<Button
						size="lg"
						action="primary"
						onPress={() => {
							console.log("[ProfileScreen] Navegando a lista de empleados");
							router.push("/(owner)/employees");
						}}
					>
						<ButtonText>Gestionar empleados</ButtonText>
					</Button>
				)}

				{/* TEMPORAL: Botón de cerrar sesión */}
				<Button
					size="lg"
					action="negative"
					onPress={() => {
						console.log("[ProfileScreen] Abriendo modal de logout");
						setShowLogoutModal(true);
					}}
				>
					<ButtonText>Cerrar sesión</ButtonText>
				</Button>
			</VStack>

			{/* Modal de confirmación */}
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
						<HStack space="md" className="w-full">
							<Button
								variant="outline"
								action="secondary"
								className="flex-1"
								onPress={() => {
									console.log("[ProfileScreen] Logout cancelado");
									setShowLogoutModal(false);
								}}
								disabled={isLoggingOut}
							>
								<ButtonText>Cancelar</ButtonText>
							</Button>
							<Button
								action="negative"
								className="flex-1"
								onPress={handleLogoutConfirm}
								disabled={isLoggingOut}
							>
								<ButtonText>
									{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
								</ButtonText>
							</Button>
						</HStack>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AppLayout>
	);
}

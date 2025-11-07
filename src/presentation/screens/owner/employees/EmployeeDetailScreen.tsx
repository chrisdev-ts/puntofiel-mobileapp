import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
	AlertCircleIcon,
	CopyIcon,
	EditIcon,
	TrashIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Modal, useWindowDimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseCircleIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useEmployee } from "@/src/presentation/hooks/useEmployee";
import { useEmployeeDetail } from "@/src/presentation/hooks/useEmployeeDetail";
import { useTemporaryPasswordStore } from "@/src/presentation/stores/temporaryPasswordStore";

type EmployeeDetailScreenProps = {
	employeeId: string;
};

export default function EmployeeDetailScreen({
	employeeId,
}: EmployeeDetailScreenProps) {
	const router = useRouter();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [copied, setCopied] = useState(false);

	// Hook para detectar pantallas pequeñas
	const { width } = useWindowDimensions();
	const isSmallScreen = width < 380;

	const { data: businessId } = useBusinessId();
	const { data: business } = useBusinessDetail(businessId);

	const {
		data: employee,
		isLoading,
		error,
	} = useEmployeeDetail(Number(employeeId));

	const getPassword = useTemporaryPasswordStore((state) => state.getPassword);
	const temporaryPassword = getPassword(Number(employeeId));

	const { deleteEmployee, isDeletingEmployee, deleteEmployeeError } =
		useEmployee(businessId);

	const [deleteSuccess, setDeleteSuccess] = useState(false);

	useEffect(() => {
		if (deleteSuccess) {
			Alert.alert("Éxito", "Empleado desactivado correctamente", [
				{ text: "OK", onPress: () => router.push("/(owner)/employees") },
			]);
		}
	}, [deleteSuccess, router]);

	const handleEditPress = () => {
		router.push(`/(owner)/employees/edit/${employeeId}` as never);
	};

	const handleDeletePress = () => {
		setShowDeleteModal(true);
	};

	const confirmDelete = () => {
		setShowDeleteModal(false);
		deleteEmployee(Number(employeeId), {
			onSuccess: () => {
				setDeleteSuccess(true);
			},
		});
	};

	const handleCopyToClipboard = async () => {
		if (!employee) return;

		const fullName = [
			employee.profile.firstName,
			employee.profile.lastName,
			employee.profile.secondLastName,
		]
			.filter(Boolean)
			.join(" ");

		const businessName = business?.name || "tu negocio";

		const passwordText = temporaryPassword
			? `Contraseña:
${temporaryPassword}

Esta contraseña solo está disponible por 24 horas después de crear la cuenta.`
			: `Contraseña:
[Contraseña proporcionada al crear la cuenta]

IMPORTANTE: Si olvidó su contraseña, debe restablecerla.`;

		const credentialsText = `${fullName}

Estas son tus credenciales para entrar al PuntoFiel de trabajo.

Credenciales:
${employee.profile.email}
+00 000 000 0000

${passwordText}

Bienvenido al PuntoFiel de ${businessName}`;

		await Clipboard.setStringAsync(credentialsText);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (isLoading) {
		return <FeedbackScreen variant="loading" title="Cargando empleado..." />;
	}

	if (error || !employee) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Empleado no encontrado"
				description={error?.message || "No se encontró el empleado"}
			/>
		);
	}

	const fullName = [
		employee.profile.firstName,
		employee.profile.lastName,
		employee.profile.secondLastName,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
		>
			<HStack className="items-center justify-between mb-4">
				<Heading size="xl" className="text-primary-500">
					Empleado
				</Heading>
				<Text className="text-typography-700 text-lg font-semibold">
					{fullName}
				</Text>
			</HStack>

			<Button
				onPress={handleCopyToClipboard}
				action={copied ? "positive" : "primary"}
				size="lg"
				className="mb-6"
			>
				<Icon as={CopyIcon} className="text-typography-0" size="sm" />
				<ButtonText className="ml-2">
					{copied ? "Copiado" : "Copiar al portapapeles"}
				</ButtonText>
			</Button>

			<VStack space="lg" className="mb-6">
				<VStack space="sm">
					<Text className="text-typography-900 font-bold text-lg">
						Nombre completo del empleado
					</Text>
					<Text className="text-typography-700 text-base">{fullName}</Text>
				</VStack>

				<VStack space="sm">
					<Text className="text-typography-900 font-bold text-base">
						Acceso
					</Text>
					<Text className="text-typography-600">{employee.profile.email}</Text>
					<Text className="text-typography-600">+00 000 000 0000</Text>
				</VStack>

				<Box
					className={
						temporaryPassword
							? "bg-success-50 p-4 rounded-lg"
							: "bg-warning-50 p-4 rounded-lg"
					}
				>
					<Text
						className={
							temporaryPassword
								? "text-success-700 text-sm font-semibold"
								: "text-warning-700 text-sm font-semibold"
						}
					>
						{temporaryPassword
							? "Contraseña disponible para copiar"
							: "Contraseña no visible"}
					</Text>
					<Text
						className={
							temporaryPassword
								? "text-success-600 text-xs mt-2"
								: "text-warning-600 text-xs mt-2"
						}
					>
						{temporaryPassword
							? "La contraseña de este empleado está disponible temporalmente (24h). Al copiar al portapapeles se incluirá la contraseña real."
							: "Por seguridad, la contraseña solo se mostró al crear la cuenta. Si el empleado la olvidó, debe usar 'Olvidé mi contraseña' o solicitar un restablecimiento."}
					</Text>
				</Box>
			</VStack>

			{deleteEmployeeError && (
				<Box className="bg-error-50 p-3 rounded-lg mb-4">
					<Text className="text-error-500">{deleteEmployeeError.message}</Text>
				</Box>
			)}

			<VStack space="md">
				<Button
					onPress={handleEditPress}
					variant="outline"
					size="lg"
					className="rounded-lg"
				>
					<Icon as={EditIcon} className="text-primary-500 mr-2" size="sm" />
					<ButtonText>Editar cuenta de empleado</ButtonText>
				</Button>

				<Button
					onPress={handleDeletePress}
					isDisabled={isDeletingEmployee}
					variant="outline"
					size="lg"
					className="rounded-lg border-error-500"
				>
					{isDeletingEmployee ? (
						<ButtonSpinner color="#F44336" />
					) : (
						<>
							<Icon
								as={CloseCircleIcon}
								className="text-error-500 mr-2"
								size="sm"
							/>
							<ButtonText className="text-error-500">
								Eliminar cuenta de empleado
							</ButtonText>
						</>
					)}
				</Button>
			</VStack>

			{/* Modal de Confirmación */}
			<Modal
				visible={showDeleteModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowDeleteModal(false)}
			>
				<Box className="flex-1 justify-center items-center bg-black/50 p-6">
					<Box className="bg-background-0 rounded-lg p-6 w-full max-w-sm">
						<VStack space="xl">
							<Heading size="lg" className="text-primary-500">
								¿Estás seguro de querer eliminar este empleado?
							</Heading>

							<Text className="text-typography-500">
								El empleado será desactivado y no podrá acceder al sistema. Por
								favor confirme si desea continuar.
							</Text>

							{/* Botones adaptables según tamaño de pantalla */}
							<HStack space="sm" className="mt-3 justify-end">
								{/* Botón Cancelar */}
								<Button
									variant="outline"
									onPress={() => setShowDeleteModal(false)}
									size="md"
									className="flex-2"
								>
									{isSmallScreen ? (
										<Icon
											as={CloseCircleIcon}
											className="text-primary-500"
											size="sm"
										/>
									) : (
										<HStack space="sm" className="items-center">
											<ButtonText size="sm" className="font-bold">
												Cancelar
											</ButtonText>
											<Icon
												as={CloseCircleIcon}
												className="text-primary-500"
												size="sm"
											/>
										</HStack>
									)}
								</Button>

								{/* Botón Eliminar */}
								<Button
									onPress={confirmDelete}
									action="negative"
									size="md"
									className="flex-2"
								>
									{isSmallScreen ? (
										<Icon
											as={TrashIcon}
											className="text-typography-0"
											size="sm"
										/>
									) : (
										<HStack space="sm" className="items-center">
											<ButtonText size="sm" className="font-bold">
												Eliminar
											</ButtonText>
											<Icon
												as={TrashIcon}
												className="text-typography-0"
												size="sm"
											/>
										</HStack>
									)}
								</Button>
							</HStack>
						</VStack>
					</Box>
				</Box>
			</Modal>
		</AppLayout>
	);
}

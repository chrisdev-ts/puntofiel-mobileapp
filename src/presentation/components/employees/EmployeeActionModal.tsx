import { AlertCircleIcon, CheckCircleIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface EmployeeActionModalProps {
	isOpen: boolean;
	onClose: () => void;
	variant: "success" | "error";
	mode: "create" | "edit";
}

export function EmployeeActionModal({
	isOpen,
	onClose,
	variant,
	mode,
}: EmployeeActionModalProps) {
	const isSuccess = variant === "success";
	const isCreate = mode === "create";

	const title = isSuccess
		? `Cuenta de empleado ${isCreate ? "registrada" : "actualizada"} exitosamente`
		: `Error al ${isCreate ? "crear" : "editar"} cuenta de empleado`;

	const description = isSuccess
		? `Se ha ${isCreate ? "registrado" : "editado"} la cuenta de empleado exitosamente, ya puedes proporcionarle las credenciales a tu empleado para que acceda a PuntoFiel de tu negocio.`
		: `Ha ocurrido un error al intentar ${isCreate ? "registrar" : "actualizar"} la cuenta de empleado, favor de intentar de nuevo.`;

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalBackdrop />
			<ModalContent className="max-w-sm">
				<ModalBody className="p-6">
					<VStack space="md">
						{/* Icono y título */}
						<VStack space="sm" className="items-center">
							<Icon
								as={isSuccess ? CheckCircleIcon : AlertCircleIcon}
								className={`w-16 h-16 ${isSuccess ? "text-success-500" : "text-error-500"}`}
							/>
							<Heading size="lg" className="text-center text-typography-900">
								{title}
							</Heading>
						</VStack>

						{/* Descripción */}
						<Text className="text-center text-typography-600">
							{description}
						</Text>
					</VStack>
				</ModalBody>
				<ModalFooter className="border-t-0 pt-0">
					<Button
						onPress={onClose}
						className={`w-full ${isSuccess ? "bg-primary-500" : "bg-error-500"}`}
					>
						<ButtonText>{isSuccess ? "Vamos" : "Entendido"}</ButtonText>
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

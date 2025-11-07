import { AlertCircleIcon, CheckCircleIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

/**
 * Props del componente SuccessDialog
 */
interface SuccessDialogProps {
	/** Indica si el diálogo está visible */
	isOpen: boolean;
	/** Función para cerrar el diálogo */
	onClose: () => void;
	/** Variante del diálogo: success o error */
	variant?: "success" | "error";
	/** Título del diálogo */
	title: string;
	/** Descripción del diálogo */
	description: string;
	/** Texto del botón de acción */
	buttonText?: string;
}

/**
 * Componente de diálogo de éxito/error
 * (componente reutilizable)
 *
 * @example
 * ```tsx
 * <SuccessDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   variant="success"
 *   title="Cuenta de empleado registrada exitosamente"
 *   description="Se ha registrado la cuenta de empleado exitosamente..."
 *   buttonText="Vamos"
 * />
 * ```
 */
export function SuccessDialog({
	isOpen,
	onClose,
	variant = "success",
	title,
	description,
	buttonText = "Aceptar",
}: SuccessDialogProps) {
	const isSuccess = variant === "success";

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalBackdrop />
			<ModalContent className="max-w-md mx-4">
				<VStack space="lg" className="p-6">
					{/* Icono */}
					<Icon
						as={isSuccess ? CheckCircleIcon : AlertCircleIcon}
						className={`w-16 h-16 mx-auto ${
							isSuccess ? "text-success-500" : "text-error-500"
						}`}
					/>

					{/* Título */}
					<Heading
						size="lg"
						className={`text-center ${
							isSuccess ? "text-success-700" : "text-error-700"
						}`}
					>
						{title}
					</Heading>

					{/* Descripción */}
					<Text className="text-typography-600 text-center leading-relaxed">
						{description}
					</Text>

					{/* Botón de acción */}
					<Button
						onPress={onClose}
						action={isSuccess ? "positive" : "primary"}
						size="lg"
						className="mt-2"
					>
						<ButtonText>{buttonText}</ButtonText>
					</Button>
				</VStack>
			</ModalContent>
		</Modal>
	);
}

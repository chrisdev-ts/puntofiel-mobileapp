import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface FeedbackModalProps {
	/** Si el modal está visible */
	visible: boolean;
	/** Callback al cerrar */
	onClose: () => void;
	/** Tipo de feedback */
	variant: "success" | "error" | "warning" | "info";
	/** Título del modal */
	title?: string;
	/** Mensaje principal */
	message: string;
	/** Texto del botón principal (por defecto "Volver") */
	buttonText?: string;
	/** Acción del botón principal (por defecto onClose) */
	onButtonPress?: () => void;
	/** Información adicional opcional (ej: nuevo balance de puntos) */
	additionalInfo?: string;
}

/**
 * Modal unificado para mostrar feedback al usuario
 * Reemplaza a SuccessOverlay y ErrorOverlay con un componente más flexible
 *
 * @example
 * // Éxito simple
 * <FeedbackModal
 *   visible={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   variant="success"
 *   message="¡Registro exitoso!"
 * />
 *
 * @example
 * // Éxito con información adicional
 * <FeedbackModal
 *   visible={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   variant="success"
 *   title="¡Puntos ganados!"
 *   message="Has ganado 10 puntos"
 *   additionalInfo="Nuevo saldo: 25 puntos"
 *   buttonText="Continuar"
 * />
 *
 * @example
 * // Error
 * <FeedbackModal
 *   visible={showError}
 *   onClose={() => setShowError(false)}
 *   variant="error"
 *   message="No se pudo completar la operación"
 * />
 */
export function FeedbackModal({
	visible,
	onClose,
	variant,
	title,
	message,
	buttonText = "Volver",
	onButtonPress,
	additionalInfo,
}: FeedbackModalProps) {
	// Configuración de colores y textos según variante
	const config = {
		success: {
			titleColor: "text-success-600",
			defaultTitle: "¡Éxito!",
			buttonAction: "positive" as const,
		},
		error: {
			titleColor: "text-error-600",
			defaultTitle: "Error",
			buttonAction: "negative" as const,
		},
		warning: {
			titleColor: "text-warning-600",
			defaultTitle: "Advertencia",
			buttonAction: "primary" as const,
		},
		info: {
			titleColor: "text-info-600",
			defaultTitle: "Información",
			buttonAction: "primary" as const,
		},
	};

	const { titleColor, defaultTitle, buttonAction } = config[variant];
	const displayTitle = title || defaultTitle;

	return (
		<Modal isOpen={visible} onClose={onClose} size="md">
			<ModalBackdrop />
			<ModalContent className="items-center">
				<ModalBody className="p-6">
					<VStack space="md" className="items-center w-full">
						{/* Título */}
						<Heading size="lg" className={titleColor}>
							{displayTitle}
						</Heading>

						{/* Mensaje principal */}
						<Text className="text-typography-700 text-center">{message}</Text>

						{/* Información adicional (opcional) */}
						{additionalInfo && (
							<Box className="bg-background-50 p-3 rounded-lg w-full">
								<Text className="text-typography-600 text-center font-medium">
									{additionalInfo}
								</Text>
							</Box>
						)}

						{/* Botón de acción */}
						<Button
							onPress={onButtonPress || onClose}
							action={buttonAction}
							size="lg"
							className="w-full mt-2"
						>
							<ButtonText>{buttonText}</ButtonText>
						</Button>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

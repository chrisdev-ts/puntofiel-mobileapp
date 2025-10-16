import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";

interface SuccessOverlayProps {
	visible: boolean;
	message: string;
	onClose: () => void;
	newPointsBalance?: number;
}

export function SuccessOverlay({
	visible,
	message,
	onClose,
	newPointsBalance,
}: SuccessOverlayProps) {
	return (
		<Modal isOpen={visible} onClose={onClose} size="md">
			<ModalBackdrop />
			<ModalContent className="items-center">
				<ModalBody>
					<Box className="items-center">
						<Text className="text-green-700 text-xl mb-2">¡Éxito!</Text>
						<Text className="mb-2">{message}</Text>
						{newPointsBalance !== undefined && (
							<Text className="mb-2">Nuevo saldo: {newPointsBalance}</Text>
						)}
						<Button
							onPress={onClose}
							variant="solid"
							action="primary"
							className="mt-4"
						>
							<ButtonText>Volver</ButtonText>
						</Button>
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

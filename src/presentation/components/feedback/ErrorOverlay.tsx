import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";

interface ErrorOverlayProps {
	visible: boolean;
	message: string;
	onClose: () => void;
}

export function ErrorOverlay({ visible, message, onClose }: ErrorOverlayProps) {
	return (
		<Modal isOpen={visible} onClose={onClose} size="md">
			<ModalBackdrop />
			<ModalContent className="items-center">
				<ModalBody>
					<Box className="items-center">
						<Text className="text-red-700 text-xl mb-2">Error</Text>
						<Text className="mb-2">{message}</Text>
						<Button
							onPress={onClose}
							variant="outline"
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

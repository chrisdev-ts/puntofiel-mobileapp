import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BusinessHoursSelector } from "@/src/presentation/components/business/BusinessHoursSelector";
import type { BusinessFormData } from "@/src/presentation/screens/owner/business/BusinessFormSchema";

type BusinessFormStep2Props = {
	control: Control<BusinessFormData>;
	onNext: () => void;
	onBack: () => void;
};

/**
 * Step 2: Horarios de atención
 * - Selector de horarios por día con BusinessHoursSelector
 */
export function BusinessFormStep2({
	control,
	onNext,
	onBack,
}: BusinessFormStep2Props) {
	return (
		<VStack className="gap-4">
			<Text className="text-base text-gray-700">
				Define tus horarios de atención
			</Text>

			<Controller
				control={control}
				name="openingHours"
				render={({ field: { onChange, value } }) => (
					<BusinessHoursSelector onChange={onChange} initialValue={value} />
				)}
			/>

			<VStack className="gap-3">
				<Button onPress={onNext} variant="solid" action="primary">
					<ButtonText>Continuar</ButtonText>
				</Button>
				<Button variant="outline" onPress={onBack}>
					<ButtonText>Atrás</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}

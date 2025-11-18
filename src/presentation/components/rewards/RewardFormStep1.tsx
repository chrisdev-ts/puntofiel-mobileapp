import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlError,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import type { CreateRewardFormValues } from "@/src/presentation/screens/owner/rewards/RewardFormSchema";

type RewardFormStep1Props = {
	control: Control<CreateRewardFormValues>;
	errors: FieldErrors<CreateRewardFormValues>;
	onNext: () => void;
	isEditMode: boolean;
};

export function RewardFormStep1({
	control,
	errors,
	onNext,
	isEditMode: _isEditMode,
}: RewardFormStep1Props) {
	return (
		<>
			<FormControl isInvalid={!!errors.name} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Nombre de la recompensa</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="name"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Ej: Café gratis"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
							/>
						</Input>
					)}
				/>
				{errors.name && (
					<FormControlError>
						<FormControlErrorText>{errors.name.message}</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			<FormControl isInvalid={!!errors.description}>
				<FormControlLabel>
					<FormControlLabelText>Descripción (opcional)</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, onBlur, value } }) => (
						<Textarea>
							<TextareaInput
								placeholder="Descripción de la recompensa..."
								value={value || ""}
								onChangeText={onChange}
								onBlur={onBlur}
							/>
						</Textarea>
					)}
				/>
				{errors.description && (
					<FormControlError>
						<FormControlErrorText>
							{errors.description.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			<FormControl isInvalid={!!errors.points_required} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Puntos necesarios</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="points_required"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Ej: 100"
								value={value === 0 ? "" : String(value)}
								onChangeText={onChange}
								onBlur={onBlur}
								keyboardType="numeric"
							/>
						</Input>
					)}
				/>
				{errors.points_required && (
					<FormControlError>
						<FormControlErrorText>
							{errors.points_required.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			<Button onPress={onNext} variant="solid" action="primary">
				<ButtonText>Continuar</ButtonText>
			</Button>
		</>
	);
}

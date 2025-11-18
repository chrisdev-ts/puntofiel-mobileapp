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
import {
	Select,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectIcon,
	SelectInput,
	SelectItem,
	SelectPortal,
	SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import type { BusinessFormData } from "@/src/presentation/screens/owner/business/BusinessFormSchema";
import { CATEGORY_LABELS } from "@/src/presentation/screens/owner/business/BusinessFormSchema";

type BusinessFormStep1Props = {
	control: Control<BusinessFormData>;
	errors: FieldErrors<BusinessFormData>;
	onNext: () => void;
};

/**
 * Step 1: Información básica del negocio
 * - Nombre del negocio
 * - Categoría
 * - Dirección
 * - Indicaciones adicionales
 */
export function BusinessFormStep1({
	control,
	errors,
	onNext,
}: BusinessFormStep1Props) {
	return (
		<VStack className="gap-4">
			<Text className="text-base text-gray-700">
				Ingresa la información básica de tu negocio
			</Text>

			<FormControl isInvalid={!!errors.name} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Nombre del negocio</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="name"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Ej: Cafetería El Portal"
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

			<FormControl isInvalid={!!errors.category} isRequired>
				<FormControlLabel>
					<FormControlLabelText>Categoría</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="category"
					render={({ field: { onChange, value } }) => (
						<Select selectedValue={value} onValueChange={onChange}>
							<SelectTrigger>
								<SelectInput placeholder="Selecciona una categoría" />
								<SelectIcon className="mr-3" />
							</SelectTrigger>
							<SelectPortal>
								<SelectBackdrop />
								<SelectContent>
									<SelectDragIndicatorWrapper>
										<SelectDragIndicator />
									</SelectDragIndicatorWrapper>
									{Object.entries(CATEGORY_LABELS).map(([key, label]) => (
										<SelectItem key={key} label={label} value={key} />
									))}
								</SelectContent>
							</SelectPortal>
						</Select>
					)}
				/>
				{errors.category && (
					<FormControlError>
						<FormControlErrorText>
							{errors.category.message}
						</FormControlErrorText>
					</FormControlError>
				)}
			</FormControl>

			<FormControl>
				<FormControlLabel>
					<FormControlLabelText>Dirección</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="locationAddress"
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								placeholder="Calle, número, colonia"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
							/>
						</Input>
					)}
				/>
			</FormControl>

			<FormControl>
				<FormControlLabel>
					<FormControlLabelText>
						Indicaciones adicionales (opcional)
					</FormControlLabelText>
				</FormControlLabel>
				<Controller
					control={control}
					name="directions"
					render={({ field: { onChange, onBlur, value } }) => (
						<Textarea>
							<TextareaInput
								placeholder="Ej: Frente al parque central"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
							/>
						</Textarea>
					)}
				/>
			</FormControl>

			<Button onPress={onNext} variant="solid" action="primary">
				<ButtonText>Continuar</ButtonText>
			</Button>
		</VStack>
	);
}

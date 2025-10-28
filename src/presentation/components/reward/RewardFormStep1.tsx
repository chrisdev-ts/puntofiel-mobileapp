import { Button, ButtonText } from '@/components/ui/button';
import {
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Textarea, TextareaInput } from '@gluestack-ui/themed';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { CreateRewardFormValues } from './RewardSchema';

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
    isEditMode,
}: RewardFormStep1Props) {
    return (
        <VStack space="lg">
            {/* Campo Nombre */}
            <FormControl isInvalid={!!errors.name} isRequired={true}>
                <FormControlLabel className="mb-2">
                    <FormControlLabelText className="text-base font-medium text-[#2F4858]">
                        Nombre de la recompensa
                    </FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            variant="outline"
                            size="lg"
                            className="bg-[#FFFFFF] border border-[#CCCCCC] rounded-lg"
                        >
                            <InputField
                                placeholder="Nombre de la recompensa"
                                placeholderTextColor="#888888"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                        </Input>
                    )}
                />
                {errors.name && (
                    <FormControlError className="mt-1">
                        <FormControlErrorText className="text-xs text-[#F44336]">
                            {errors.name.message}
                        </FormControlErrorText>
                    </FormControlError>
                )}
            </FormControl>

            {/* Campo Detalles */}
            <FormControl isInvalid={!!errors.description} isRequired={true}>
                <FormControlLabel className="mb-2">
                    <FormControlLabelText className="text-base font-medium text-[#2F4858]">
                        Detalles
                    </FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Textarea className="bg-[#FFFFFF] border border-[#CCCCCC] rounded-lg min-h-[150px]">
                            <TextareaInput
                                placeholder="Descripción de la recompensa..."
                                placeholderTextColor="#888888"
                                value={value || ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                className="text-base text-[#333333] p-3"
                            />
                        </Textarea>
                    )}
                />
                {errors.description && (
                    <FormControlError className="mt-1">
                        <FormControlErrorText className="text-xs text-[#F44336]">
                            {errors.description.message}
                        </FormControlErrorText>
                    </FormControlError>
                )}
            </FormControl>

            {/* Campo Puntos */}
            <FormControl isInvalid={!!errors.points_required} isRequired={true}>
                <FormControlLabel className="mb-2">
                    <FormControlLabelText className="text-base font-medium text-[#2F4858]">
                        Puntos necesarios
                    </FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="points_required"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            variant="outline"
                            size="lg"
                            className="bg-[#FFFFFF] border border-[#CCCCCC] rounded-lg"
                        >
                            <InputField
                                placeholder="000"
                                placeholderTextColor="#888888"
                                value={value === 0 ? '' : String(value)}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="numeric"
                            />
                        </Input>
                    )}
                />
                {errors.points_required && (
                    <FormControlError className="mt-1">
                        <FormControlErrorText className="text-xs text-[#F44336]">
                            {errors.points_required.message}
                        </FormControlErrorText>
                    </FormControlError>
                )}
            </FormControl>

            {/* Botón Continuar */}
            <Button
                onPress={onNext}
                size="lg"
                className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg mt-6"
            >
                <ButtonText className="text-[#FFFFFF] font-medium text-base">
                    Continuar
                </ButtonText>
            </Button>
        </VStack>
    );
}
import { Button, ButtonText } from "@/components/ui/button";
import {
    FormControl,
    FormControlError,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Textarea, TextareaInput } from "@gluestack-ui/themed";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Keyboard, Platform, Pressable } from "react-native";
import type { CreateRaffleFormValues } from "./RaffleSchema";

type RaffleFormStep1Props = {
    control: Control<CreateRaffleFormValues>;
    errors: FieldErrors<CreateRaffleFormValues>;
    onNext: () => void;
    isEditMode: boolean;
};

export function RaffleFormStep1({
    control,
    errors,
    onNext,
    isEditMode: _isEditMode,
}: RaffleFormStep1Props) {
    // Estado para el DatePicker
    const [showPicker, setShowPicker] = useState<{ show: boolean; mode: 'start' | 'end' }>({ show: false, mode: 'start' });

    // Formatear fecha para visualización (DD / MM / AAAA)
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <VStack space="lg">
            {/* Nombre */}
            <FormControl isInvalid={!!errors.name} isRequired>
                <FormControlLabel className="mb-1">
                    <FormControlLabelText className="text-primary-500 font-medium">Nombre de la rifa anual</FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg">
                            <InputField placeholder="Ej. Gran Rifa Navideña" value={value} onChangeText={onChange} onBlur={onBlur} />
                        </Input>
                    )}
                />
                <FormControlError><FormControlErrorText>{errors.name?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Premio Principal */}
            <FormControl isInvalid={!!errors.prize} isRequired>
                <FormControlLabel className="mb-1">
                    <FormControlLabelText className="text-primary-500 font-medium">Premio principal</FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="prize"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg">
                            <InputField placeholder="Ej. Motocicleta 2025" value={value} onChangeText={onChange} onBlur={onBlur} />
                        </Input>
                    )}
                />
                <FormControlError><FormControlErrorText>{errors.prize?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Detalles */}
            <FormControl isInvalid={!!errors.description} isRequired>
                <FormControlLabel className="mb-1">
                    <FormControlLabelText className="text-primary-500 font-medium">Detalles</FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Textarea className="bg-white border border-gray-300 rounded-lg min-h-[100px]">
                            <TextareaInput
                                placeholder="Describe las bases, condiciones y detalles del premio..."
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                className="text-base text-typography-900 p-3"
                            />
                        </Textarea>
                    )}
                />
                <FormControlError><FormControlErrorText>{errors.description?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Puntos Necesarios */}
            <FormControl isInvalid={!!errors.points_required} isRequired>
                <FormControlLabel className="mb-1">
                    <FormControlLabelText className="text-primary-500 font-medium">Puntos necesarios para participar</FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="points_required"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg">
                            <InputField
                                placeholder="000"
                                keyboardType="numeric"
                                value={value === 0 ? "" : value?.toString()}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                        </Input>
                    )}
                />
                <FormControlError><FormControlErrorText>{errors.points_required?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Máximo de Boletos */}
            <FormControl isInvalid={!!errors.max_tickets_per_user} isRequired>
                <FormControlLabel className="mb-1">
                    <FormControlLabelText className="text-primary-500 font-medium">Máximo de boletos por cliente</FormControlLabelText>
                </FormControlLabel>
                <Controller
                    control={control}
                    name="max_tickets_per_user"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg">
                            <InputField
                                placeholder="000"
                                keyboardType="numeric"
                                value={value === 0 ? "" : value?.toString()}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                        </Input>
                    )}
                />
                <FormControlError><FormControlErrorText>{errors.max_tickets_per_user?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Fechas de Inicio y Fin */}
            {['start_date', 'end_date'].map((fieldName) => (
                <Controller
                    key={fieldName}
                    control={control}
                    name={fieldName as 'start_date' | 'end_date'}
                    render={({ field: { value, onChange } }) => (
                        <FormControl isInvalid={!!errors[fieldName as keyof CreateRaffleFormValues]} isRequired>
                            <FormControlLabel className="mb-1">
                                <FormControlLabelText className="text-primary-500 font-medium">
                                    {fieldName === 'start_date' ? 'Fecha de inicio' : 'Fecha de finalización'}
                                </FormControlLabelText>
                            </FormControlLabel>

                            <Pressable onPress={() => {
                                Keyboard.dismiss(); // Cerrar teclado si está abierto
                                setShowPicker({ show: true, mode: fieldName === 'start_date' ? 'start' : 'end' });
                            }}>
                                <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg" isReadOnly>
                                    <InputField
                                        placeholder="DD / MM / AAAA"
                                        value={value ? formatDate(value) : ''}
                                        editable={false}
                                        onPressIn={() => {
                                            Keyboard.dismiss();
                                            setShowPicker({ show: true, mode: fieldName === 'start_date' ? 'start' : 'end' });
                                        }}
                                    />
                                </Input>
                            </Pressable>

                            <FormControlError><FormControlErrorText>{errors[fieldName as keyof CreateRaffleFormValues]?.message}</FormControlErrorText></FormControlError>

                            {/* Componente DatePicker */}
                            {showPicker.show && showPicker.mode === (fieldName === 'start_date' ? 'start' : 'end') && (
                                <DateTimePicker
                                    value={value || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        // En Android el picker se cierra solo al seleccionar
                                        if (Platform.OS === 'android') {
                                            setShowPicker({ ...showPicker, show: false });
                                        }
                                        if (selectedDate) {
                                            onChange(selectedDate);
                                        }
                                    }}
                                    minimumDate={new Date()} // No permitir fechas pasadas
                                />
                            )}
                        </FormControl>
                    )}
                />
            ))}

            <Button onPress={onNext} size="lg" className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg mt-4 mb-6">
                <ButtonText className="text-white font-medium">Continuar</ButtonText>
            </Button>
        </VStack>
    );
}
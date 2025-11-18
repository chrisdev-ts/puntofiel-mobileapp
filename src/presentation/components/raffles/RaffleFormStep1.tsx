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
import type { Control, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Keyboard, Platform, Pressable } from "react-native";
import type { CreateRaffleFormValues } from "./RaffleSchema";

type RaffleFormStep1Props = {
    control: Control<CreateRaffleFormValues>;
    errors: FieldErrors<CreateRaffleFormValues>;
    onNext: () => void;
    isEditMode: boolean;
    // 👇 Nuevas props para la lógica de fechas
    setValue: UseFormSetValue<CreateRaffleFormValues>;
    watch: UseFormWatch<CreateRaffleFormValues>;
};

export function RaffleFormStep1({
    control,
    errors,
    onNext,
    isEditMode,
    setValue,
    watch,
}: RaffleFormStep1Props) {
    const [showPicker, setShowPicker] = useState<{ show: boolean; mode: 'start' | 'end' }>({ show: false, mode: 'start' });

    // Helper para formatear fecha
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <VStack space="lg">
            {/* Nombre */}
            <FormControl isInvalid={!!errors.name} isRequired>
                <FormControlLabel className="mb-1"><FormControlLabelText className="text-primary-500 font-medium">Nombre de la rifa anual</FormControlLabelText></FormControlLabel>
                <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                    <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg"><InputField placeholder="Ej. Gran Rifa 2025" value={value} onChangeText={onChange} onBlur={onBlur} /></Input>
                )} />
                <FormControlError><FormControlErrorText>{errors.name?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Premio */}
            <FormControl isInvalid={!!errors.prize} isRequired>
                <FormControlLabel className="mb-1"><FormControlLabelText className="text-primary-500 font-medium">Premio principal</FormControlLabelText></FormControlLabel>
                <Controller control={control} name="prize" render={({ field: { onChange, onBlur, value } }) => (
                    <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg"><InputField placeholder="Ej. Motocicleta 2025" value={value} onChangeText={onChange} onBlur={onBlur} /></Input>
                )} />
                <FormControlError><FormControlErrorText>{errors.prize?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Detalles */}
            <FormControl isInvalid={!!errors.description} isRequired>
                <FormControlLabel className="mb-1"><FormControlLabelText className="text-primary-500 font-medium">Detalles</FormControlLabelText></FormControlLabel>
                <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
                    <Textarea className="bg-white border border-gray-300 rounded-lg min-h-[100px]"><TextareaInput placeholder="Describe las bases..." value={value} onChangeText={onChange} onBlur={onBlur} /></Textarea>
                )} />
                <FormControlError><FormControlErrorText>{errors.description?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Puntos */}
            <FormControl isInvalid={!!errors.points_required} isRequired>
                <FormControlLabel className="mb-1"><FormControlLabelText className="text-primary-500 font-medium">Puntos necesarios</FormControlLabelText></FormControlLabel>
                <Controller control={control} name="points_required" render={({ field: { onChange, onBlur, value } }) => (
                    <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg"><InputField placeholder="000" keyboardType="numeric" value={value === 0 ? "" : value?.toString()} onChangeText={onChange} onBlur={onBlur} /></Input>
                )} />
                <FormControlError><FormControlErrorText>{errors.points_required?.message}</FormControlErrorText></FormControlError>
            </FormControl>

            {/* Máximo Boletos (Oculto si es 1 fijo, pero lo dejo por si acaso) */}
            {/* <FormControl ... /> */}

            {/* --- FECHA INICIO --- */}
            <FormControl isInvalid={!!errors.start_date} isRequired>
                <FormControlLabel className="mb-1"><FormControlLabelText className="text-primary-500 font-medium">Fecha de inicio</FormControlLabelText></FormControlLabel>
                <Controller
                    control={control}
                    name="start_date"
                    render={({ field: { value, onChange } }) => (
                        <>
                            <Pressable onPress={() => { Keyboard.dismiss(); setShowPicker({ show: true, mode: 'start' }); }}>
                                {/* pointerEvents="none" asegura que el click pase al Pressable */}
                                <Input variant="outline" size="lg" className="bg-white border-gray-300 rounded-lg" isReadOnly pointerEvents="none">
                                    <InputField
                                        placeholder="DD / MM / AAAA"
                                        value={value ? formatDate(value) : ''}
                                        editable={false}
                                    />
                                </Input>
                            </Pressable>
                            <FormControlError><FormControlErrorText>{errors.start_date?.message}</FormControlErrorText></FormControlError>

                            {showPicker.show && showPicker.mode === 'start' && (
                                <DateTimePicker
                                    value={value || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    // 👇 SIN minimumDate para permitir pruebas en el pasado
                                    onChange={(event, selectedDate) => {
                                        if (Platform.OS === 'android') setShowPicker({ ...showPicker, show: false });
                                        if (selectedDate) {
                                            onChange(selectedDate);

                                            // 🤖 LÓGICA DE AUTO-LLENADO (Comenta esto si quieres manual total)
                                            const nextYear = new Date(selectedDate);
                                            nextYear.setFullYear(nextYear.getFullYear() + 1);
                                            setValue('end_date', nextYear);
                                        }
                                    }}
                                />
                            )}
                        </>
                    )}
                />
            </FormControl>

            {/* --- FECHA FIN --- */}
            <FormControl isInvalid={!!errors.end_date} isRequired>
                <FormControlLabel className="mb-1"><FormControlLabelText className="text-primary-500 font-medium">Fecha de finalización</FormControlLabelText></FormControlLabel>
                <Controller
                    control={control}
                    name="end_date"
                    render={({ field: { value, onChange } }) => (
                        <>
                            <Pressable onPress={() => { Keyboard.dismiss(); setShowPicker({ show: true, mode: 'end' }); }}>
                                {/* bg-gray-100 para indicar visualmente que es automático/deshabilitado */}
                                <Input variant="outline" size="lg" className="bg-gray-100 border-gray-300 rounded-lg" isReadOnly pointerEvents="none">
                                    <InputField
                                        placeholder="DD / MM / AAAA"
                                        value={value ? formatDate(value) : ''}
                                        editable={false}
                                    />
                                </Input>
                            </Pressable>
                            <FormControlError><FormControlErrorText>{errors.end_date?.message}</FormControlErrorText></FormControlError>

                            {showPicker.show && showPicker.mode === 'end' && (
                                <DateTimePicker
                                    value={value || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    // 👇 SIN minimumDate para permitir pruebas
                                    onChange={(event, selectedDate) => {
                                        if (Platform.OS === 'android') setShowPicker({ ...showPicker, show: false });
                                        if (selectedDate) onChange(selectedDate);
                                    }}
                                />
                            )}
                        </>
                    )}
                />
            </FormControl>

            <Button onPress={onNext} size="lg" className="bg-[#2F4858] active:bg-[#1A2830] rounded-lg mt-4 mb-6">
                <ButtonText className="text-white font-medium">Continuar</ButtonText>
            </Button>
        </VStack>
    );
}